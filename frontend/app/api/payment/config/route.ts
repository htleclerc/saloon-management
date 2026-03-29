import { NextResponse } from 'next/server';
import { getPaymentConfig } from '@/lib/payment/config';

/**
 * GET /api/payment/config
 *
 * Returns the public payment configuration (no secrets).
 * Used by the frontend to know which providers are available.
 */
export async function GET() {
    try {
        const config = getPaymentConfig();
        return NextResponse.json(config);
    } catch (error) {
        console.error('Payment config error:', error);
        return NextResponse.json(
            { error: 'Failed to load payment configuration' },
            { status: 500 }
        );
    }
}
