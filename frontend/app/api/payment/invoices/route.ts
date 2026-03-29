import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getProvider, isDemoMode } from '@/lib/payment/service';
import type { InvoiceInfo } from '@/types/payment';

/**
 * GET /api/payment/invoices
 *
 * Lists invoices for the current user's salon.
 * Query params: ?provider=stripe&limit=10
 */
export async function GET(request: Request) {
    try {
        if (isDemoMode()) {
            // Return mock data in demo mode
            const mockInvoices: InvoiceInfo[] = [
                {
                    id: 'demo_inv_1',
                    provider: 'demo',
                    amount: 29,
                    currency: 'EUR',
                    status: 'paid',
                    date: new Date().toISOString(),
                    description: 'Pro Plan - Monthly',
                },
                {
                    id: 'demo_inv_2',
                    provider: 'demo',
                    amount: 29,
                    currency: 'EUR',
                    status: 'paid',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Pro Plan - Monthly',
                },
            ];
            return NextResponse.json({ invoices: mockInvoices, isDemoMode: true });
        }

        const supabase = await createSupabaseServerClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const providerName = searchParams.get('provider') || undefined;
        const limit = parseInt(searchParams.get('limit') || '10', 10);

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
            return NextResponse.json({ invoices: [] });
        }

        const invoices = await paymentProvider.getInvoices(paymentCustomer.customer_id, limit);
        return NextResponse.json({ invoices });
    } catch (error) {
        console.error('Invoices error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to load invoices' },
            { status: 500 }
        );
    }
}
