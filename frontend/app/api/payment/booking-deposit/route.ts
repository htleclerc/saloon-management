import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { getProvider, isDemoMode } from '@/lib/payment/service';
import { getPaymentConfig } from '@/lib/payment/config';

/**
 * POST /api/payment/booking-deposit
 *
 * Creates a one-time checkout session to pay the deposit of a booking.
 * Body: { bookingId, provider? }
 * The caller must be authenticated and either belong to the salon staff
 * or be the client of the booking (matched by e-mail).
 */
export async function POST(request: NextRequest) {
    try {
        // Demo mode → the client marks the deposit as paid locally
        if (isDemoMode()) {
            return NextResponse.json({
                isDemoMode: true,
                message: 'Payment is in demo mode. No providers configured.',
            });
        }

        const supabase = await createSupabaseServerClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const bookingId = Number(body?.bookingId);
        if (!bookingId) {
            return NextResponse.json({ error: 'Missing required field: bookingId' }, { status: 400 });
        }

        const admin = createSupabaseAdmin();
        const { data: booking } = await admin
            .from('bookings')
            .select('id, salon_id, client_id, status, deposit_amount, deposit_status, date, time, client:clients(email, name)')
            .eq('id', bookingId)
            .single();

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const depositAmount = Number(booking.deposit_amount) || 0;
        if (depositAmount <= 0) {
            return NextResponse.json({ error: 'No deposit is required for this booking' }, { status: 400 });
        }
        if (booking.deposit_status === 'paid') {
            return NextResponse.json({ error: 'Deposit already paid' }, { status: 400 });
        }
        if (booking.status === 'Cancelled' || booking.status === 'Closed') {
            return NextResponse.json({ error: 'This booking can no longer be paid' }, { status: 400 });
        }

        // Authorization: salon staff or the booking's client
        const { data: dbUser } = await admin
            .from('users')
            .select('id')
            .eq('auth_id', authUser.id)
            .single();

        let allowed = false;
        if (dbUser) {
            const { data: membership } = await admin
                .from('user_salons')
                .select('salon_id')
                .eq('user_id', dbUser.id)
                .eq('salon_id', booking.salon_id)
                .eq('is_active', true)
                .limit(1);
            allowed = !!(membership && membership.length > 0);
        }
        const bookingClient = Array.isArray(booking.client) ? booking.client[0] : booking.client;
        const clientEmail = (bookingClient as { email?: string } | null)?.email;
        if (!allowed && clientEmail && authUser.email && clientEmail.toLowerCase() === authUser.email.toLowerCase()) {
            allowed = true;
        }
        if (!allowed) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Salon currency and name for the checkout line
        const { data: salon } = await admin
            .from('salons')
            .select('name, currency')
            .eq('id', booking.salon_id)
            .single();

        const config = getPaymentConfig();
        const selectedProvider = (body?.provider as string | undefined) || config.defaultProvider;
        const paymentProvider = getProvider(selectedProvider);
        if (!paymentProvider.createOneTimeCheckout) {
            return NextResponse.json(
                { error: `Provider "${selectedProvider}" does not support one-time payments` },
                { status: 400 }
            );
        }

        const origin = request.nextUrl.origin;
        const result = await paymentProvider.createOneTimeCheckout({
            salonId: booking.salon_id,
            bookingId: booking.id,
            amount: depositAmount,
            currency: salon?.currency || 'USD',
            description: `${salon?.name || 'Salon'} - Booking deposit #${booking.id} (${booking.date} ${String(booking.time).slice(0, 5)})`,
            customerEmail: authUser.email || clientEmail || undefined,
            successUrl: `${origin}/appointments?deposit=success&bookingId=${booking.id}`,
            cancelUrl: `${origin}/appointments?deposit=cancel&bookingId=${booking.id}`,
        });

        // Keep the checkout reference so a later webhook can be matched
        await admin
            .from('bookings')
            .update({ deposit_reference: result.sessionId })
            .eq('id', booking.id);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Booking deposit checkout error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to create deposit checkout' },
            { status: 500 }
        );
    }
}
