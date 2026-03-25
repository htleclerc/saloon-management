import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getProvider, isDemoMode } from '@/lib/payment/service';

/**
 * POST /api/payment/cancel
 *
 * Cancels the current subscription.
 * Body: { subscriptionId, provider?, cancelAtPeriodEnd? }
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
        const { subscriptionId, provider: providerName, cancelAtPeriodEnd = true } = body;

        if (!subscriptionId) {
            return NextResponse.json(
                { error: 'Missing required field: subscriptionId' },
                { status: 400 }
            );
        }

        const paymentProvider = getProvider(providerName);
        await paymentProvider.cancelSubscription(subscriptionId, cancelAtPeriodEnd);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cancel error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
