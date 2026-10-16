import { NextResponse, type NextRequest } from 'next/server';
import { getProvider } from '@/lib/payment/service';
import { isProviderActive } from '@/lib/payment/config';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/payment/webhook/stripe
 *
 * Handles incoming Stripe webhook events.
 * No auth required — verified via Stripe signature.
 */
export async function POST(request: NextRequest) {
    try {
        if (!isProviderActive('stripe')) {
            return NextResponse.json(
                { error: 'Stripe provider is not active' },
                { status: 400 }
            );
        }

        const payload = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing stripe-signature header' },
                { status: 400 }
            );
        }

        const stripeProvider = getProvider('stripe');
        const result = await stripeProvider.handleWebhook(payload, signature);

        // Log event for idempotency
        try {
            const admin = createSupabaseAdmin();
            const parsed = JSON.parse(payload);

            // Check idempotency — skip if already processed
            const { data: existing } = await admin
                .from('payment_events')
                .select('id')
                .eq('event_id', parsed.id)
                .single();

            if (existing) {
                return NextResponse.json({ received: true, duplicate: true });
            }

            // Store event
            await admin.from('payment_events').insert({
                provider: 'stripe',
                event_id: parsed.id,
                event_type: parsed.type,
                salon_id: result.salonId || null,
                payload: parsed,
            });

            // Booking deposit outcome — confirm the booking once the deposit is paid
            if (result.handled && (result.action === 'booking_deposit_paid' || result.action === 'booking_deposit_failed') && result.data?.bookingId) {
                const bookingId = Number(result.data.bookingId);
                const paid = result.action === 'booking_deposit_paid';
                const { data: booking } = await admin
                    .from('bookings')
                    .select('id, status')
                    .eq('id', bookingId)
                    .single();

                if (booking) {
                    const updates: Record<string, unknown> = {
                        deposit_status: paid ? 'paid' : 'failed',
                        deposit_reference: result.data.sessionId as string,
                    };
                    if (paid && (booking.status === 'Pending' || booking.status === 'Created')) {
                        updates.status = 'Confirmed';
                    }
                    await admin.from('bookings').update(updates).eq('id', bookingId);
                    const { error: histError } = await admin.from('interaction_history').insert({
                        salon_id: result.salonId || null,
                        entity_type: 'booking',
                        entity_id: bookingId,
                        action: paid ? 'deposit_paid' : 'deposit_failed',
                        user_code: 'STRIPE',
                        comment: `Checkout session ${result.data.sessionId}`,
                    });
                    if (histError) console.warn('Could not log deposit history:', histError.message);
                }
            }

            // Handle subscription changes — update salon subscription status
            if (result.handled && result.salonId) {
                if (result.action === 'checkout_completed' && result.data?.planId) {
                    await admin
                        .from('salons')
                        .update({
                            subscription_plan: result.data.planId as string,
                            subscription_status: 'active',
                        })
                        .eq('id', result.salonId);
                }

                if (result.action === 'subscription_deleted') {
                    await admin
                        .from('salons')
                        .update({
                            subscription_plan: 'free',
                            subscription_status: 'canceled',
                        })
                        .eq('id', result.salonId);
                }

                if (result.action === 'subscription_updated' && result.status) {
                    await admin
                        .from('salons')
                        .update({
                            subscription_status: result.status,
                        })
                        .eq('id', result.salonId);
                }
            }
        } catch (dbError) {
            // Don't fail the webhook if DB operations fail
            console.error('Failed to log payment event:', dbError);
        }

        return NextResponse.json({ received: true, result });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Webhook processing failed' },
            { status: 400 }
        );
    }
}
