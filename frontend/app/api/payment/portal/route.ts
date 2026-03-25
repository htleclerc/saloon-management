import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getProvider, isDemoMode } from '@/lib/payment/service';

/**
 * POST /api/payment/portal
 *
 * Creates a customer portal session for managing subscription.
 * Body: { provider? }
 */
export async function POST(request: NextRequest) {
    try {
        if (isDemoMode()) {
            return NextResponse.json({
                isDemoMode: true,
                message: 'Payment is in demo mode.',
            });
        }

        const supabase = await createSupabaseServerClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const providerName = body.provider;

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

        // Get payment provider
        const paymentProvider = getProvider(providerName);

        // Get customer ID
        const { data: paymentCustomer } = await supabase
            .from('payment_customers')
            .select('customer_id')
            .eq('salon_id', userSalon.salon_id)
            .eq('provider', paymentProvider.name)
            .single();

        if (!paymentCustomer) {
            return NextResponse.json(
                { error: 'No payment customer found. Please subscribe first.' },
                { status: 404 }
            );
        }

        const returnUrl = `${request.nextUrl.origin}/settings/billing`;
        const result = await paymentProvider.createPortalSession(paymentCustomer.customer_id, returnUrl);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Portal error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to create portal session' },
            { status: 500 }
        );
    }
}
