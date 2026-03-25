import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getProvider, isDemoMode } from '@/lib/payment/service';
import type { PaymentMethodInfo } from '@/types/payment';

/**
 * GET /api/payment/methods
 *
 * Lists payment methods for the current user's salon.
 * Query params: ?provider=stripe
 */
export async function GET(request: Request) {
    try {
        if (isDemoMode()) {
            // Return mock data in demo mode
            const mockMethods: PaymentMethodInfo[] = [
                {
                    id: 'demo_pm_1',
                    provider: 'demo',
                    type: 'card',
                    last4: '4242',
                    brand: 'visa',
                    expiryMonth: 12,
                    expiryYear: 2027,
                    isDefault: true,
                },
            ];
            return NextResponse.json({ methods: mockMethods, isDemoMode: true });
        }

        const supabase = await createSupabaseServerClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get provider from query params
        const { searchParams } = new URL(request.url);
        const providerName = searchParams.get('provider') || undefined;

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

        const paymentProvider = getProvider(providerName);

        const { data: paymentCustomer } = await supabase
            .from('payment_customers')
            .select('customer_id')
            .eq('salon_id', userSalon.salon_id)
            .eq('provider', paymentProvider.name)
            .single();

        if (!paymentCustomer) {
            return NextResponse.json({ methods: [] });
        }

        const methods = await paymentProvider.getPaymentMethods(paymentCustomer.customer_id);
        return NextResponse.json({ methods });
    } catch (error) {
        console.error('Payment methods error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to load payment methods' },
            { status: 500 }
        );
    }
}
