/**
 * PayPal Payment Provider (Stub)
 *
 * Structure ready to be completed when PayPal integration is needed.
 * All methods throw a "not yet implemented" error.
 */

import type {
    IPaymentProvider,
    CheckoutParams,
    CheckoutResult,
    PortalResult,
    CreateCustomerParams,
    PaymentMethodInfo,
    InvoiceInfo,
    WebhookResult,
} from '@/types/payment';

const NOT_IMPLEMENTED = 'PayPal payment provider is not yet implemented. Please use Stripe or contact support.';

export class PayPalProvider implements IPaymentProvider {
    readonly name = 'paypal';
    readonly displayName = 'PayPal';

    async createCustomer(_params: CreateCustomerParams): Promise<string> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async createCheckoutSession(_params: CheckoutParams): Promise<CheckoutResult> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async createPortalSession(_customerId: string, _returnUrl: string): Promise<PortalResult> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async cancelSubscription(_subscriptionId: string, _cancelAtPeriodEnd?: boolean): Promise<void> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async getPaymentMethods(_customerId: string): Promise<PaymentMethodInfo[]> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async getInvoices(_customerId: string, _limit?: number): Promise<InvoiceInfo[]> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async handleWebhook(_payload: string, _signature: string): Promise<WebhookResult> {
        throw new Error(NOT_IMPLEMENTED);
    }
}
