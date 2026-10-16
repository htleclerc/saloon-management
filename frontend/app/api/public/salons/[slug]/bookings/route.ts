import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { getPublicSalon, createPublicBooking, PublicBookingError } from '@/lib/public-booking/server';
import { PublicBookingRequestSchema } from '@/lib/validators/publicBooking.schemas';
import { getProvider, isDemoMode } from '@/lib/payment/service';
import { getPaymentConfig } from '@/lib/payment/config';

/**
 * POST /api/public/salons/[slug]/bookings
 *
 * Creates a booking for a client without an account (public booking page).
 * Prices, duration, deposit and slot availability are recomputed server side.
 * When a deposit is due and a payment provider is configured, a checkout URL is returned.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        const body = await request.json().catch(() => null);
        const parsed = PublicBookingRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid booking' }, { status: 400 });
        }

        const admin = createSupabaseAdmin();
        const payload = await getPublicSalon(admin, slug);
        if (!payload) {
            return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
        }

        const result = await createPublicBooking(admin, payload, parsed.data);

        // Deposit: start a one-time checkout when a provider is configured
        let checkoutUrl: string | undefined;
        let paymentMode: 'checkout' | 'demo' | 'none' = 'none';
        if (result.depositAmount > 0) {
            if (isDemoMode()) {
                paymentMode = 'demo';
            } else {
                try {
                    const provider = getProvider(getPaymentConfig().defaultProvider);
                    if (provider.createOneTimeCheckout) {
                        const origin = request.nextUrl.origin;
                        const checkout = await provider.createOneTimeCheckout({
                            salonId: payload.salon.id,
                            bookingId: result.bookingId,
                            amount: result.depositAmount,
                            currency: payload.salon.currency,
                            description: `${payload.salon.name} - Booking deposit #${result.bookingId} (${parsed.data.date} ${parsed.data.time})`,
                            customerEmail: parsed.data.client.email || undefined,
                            successUrl: `${origin}/book/${slug}?booking=${result.bookingId}&deposit=success`,
                            cancelUrl: `${origin}/book/${slug}?booking=${result.bookingId}&deposit=cancel`,
                        });
                        checkoutUrl = checkout.url;
                        paymentMode = 'checkout';
                        await admin.from('bookings').update({ deposit_reference: checkout.sessionId }).eq('id', result.bookingId);
                    }
                } catch (paymentError) {
                    // The booking exists; the client can pay later from the salon
                    console.error('Deposit checkout could not be created:', paymentError);
                }
            }
        }

        return NextResponse.json({ ...result, checkoutUrl, paymentMode }, { status: 201 });
    } catch (error) {
        if (error instanceof PublicBookingError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('Public booking error:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
