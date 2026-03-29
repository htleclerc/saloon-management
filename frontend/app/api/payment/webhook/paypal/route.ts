import { NextResponse, type NextRequest } from 'next/server';
import { isProviderActive } from '@/lib/payment/config';

/**
 * POST /api/payment/webhook/paypal
 *
 * Stub for PayPal webhook handling.
 * Will be implemented when PayPal provider is completed.
 */
export async function POST(_request: NextRequest) {
    if (!isProviderActive('paypal')) {
        return NextResponse.json(
            { error: 'PayPal provider is not active' },
            { status: 400 }
        );
    }

    // TODO: Implement PayPal webhook verification and handling
    return NextResponse.json(
        { error: 'PayPal webhooks are not yet implemented' },
        { status: 501 }
    );
}
