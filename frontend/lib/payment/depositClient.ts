/**
 * Client-side helper to start a booking deposit payment.
 * Calls the booking-deposit API route and normalises its answer.
 */

export type DepositCheckoutResult =
    | { kind: 'redirect'; url: string; sessionId?: string }
    | { kind: 'demo' }
    | { kind: 'error'; message: string };

export async function requestDepositCheckout(bookingId: number, provider?: string): Promise<DepositCheckoutResult> {
    try {
        const response = await fetch('/api/payment/booking-deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, provider }),
        });
        const payload: { url?: string; sessionId?: string; isDemoMode?: boolean; error?: string } =
            await response.json().catch(() => ({}));

        if (response.ok && payload.url) {
            return { kind: 'redirect', url: payload.url, sessionId: payload.sessionId };
        }
        if (payload.isDemoMode) {
            return { kind: 'demo' };
        }
        return { kind: 'error', message: payload.error || `HTTP ${response.status}` };
    } catch (err) {
        return { kind: 'error', message: err instanceof Error ? err.message : 'Network error' };
    }
}
