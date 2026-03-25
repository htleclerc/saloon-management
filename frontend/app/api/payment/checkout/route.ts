import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getProvider, isDemoMode } from '@/lib/payment/service';
import { getPaymentConfig } from '@/lib/payment/config';

/**
 * POST /api/payment/checkout
 *
 * Creates a checkout session for subscription upgrade.
 * Body: { planId, provider?, priceId }
 */
export async function POST(request: NextRequest) {
    try {
        // Demo mode → return mock
        if (isDemoMode()) {
            return NextResponse.json({
                isDemoMode: true,
                message: 'Payment is in demo mode. No providers configured.',
            });
        }

        // Auth check
        const supabase = await createSupabaseServerClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse body
        const body = await request.json();
        const { planId, provider: providerName, priceId } = body;

        if (!planId || !priceId) {
            return NextResponse.json(
                { error: 'Missing required fields: planId, priceId' },
                { status: 400 }
            );
        }

        // Get user's salon
        const { data: dbUser } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', authUser.id)
            .single();

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: userSalon } = await supabase
            .from('user_salons')
            .select('salon_id')
            .eq('user_id', dbUser.id)
            .eq('is_active', true)
            .limit(1)
            .single();

        if (!userSalon) {
            return NextResponse.json({ error: 'No active salon found' }, { status: 404 });
        }

        const salonId = userSalon.salon_id;

        // Resolve provider
        const config = getPaymentConfig();
        const selectedProvider = providerName || config.defaultProvider;
        const paymentProvider = getProvider(selectedProvider);

        // Check if customer already exists for this salon + provider
        const { data: existingCustomer } = await supabase
            .from('payment_customers')
            .select('customer_id')
            .eq('salon_id', salonId)
            .eq('provider', selectedProvider)
            .single();

        let customerId = existingCustomer?.customer_id;

        // Create customer if needed
        if (!customerId) {
            const { data: salon } = await supabase
                .from('salons')
                .select('name')
                .eq('id', salonId)
                .single();

            customerId = await paymentProvider.createCustomer({
                salonId,
                email: authUser.email || '',
                name: salon?.name || 'Salon',
            });

            // Save customer mapping
            await supabase.from('payment_customers').insert({
                salon_id: salonId,
                provider: selectedProvider,
                customer_id: customerId,
            });
        }

        // Build URLs
        const origin = request.nextUrl.origin;
        const successUrl = `${origin}/settings/billing/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`;
        const cancelUrl = `${origin}/settings/billing/cancel`;

        // Create checkout session
        const result = await paymentProvider.createCheckoutSession({
            salonId,
            planId,
            priceId,
            customerId,
            customerEmail: authUser.email || '',
            successUrl,
            cancelUrl,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
