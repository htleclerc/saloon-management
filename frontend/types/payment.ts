/**
 * PAYMENT SYSTEM - Types & Interfaces
 *
 * Modular payment provider architecture supporting Stripe, PayPal, Mobile Money, etc.
 * Providers are activated/deactivated via PAYMENT_PROVIDERS env var.
 */

// ============================================================
// PROVIDER INTERFACE
// ============================================================

export interface IPaymentProvider {
    /** Unique provider name (e.g. 'stripe', 'paypal', 'mobilemoney') */
    readonly name: string;

    /** Human-readable display name */
    readonly displayName: string;

    /** Create a checkout session for a new subscription */
    createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;

    /** Create a portal/management session for the customer */
    createPortalSession(customerId: string, returnUrl: string): Promise<PortalResult>;

    /** Cancel an active subscription */
    cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<void>;

    /** List payment methods for a customer */
    getPaymentMethods(customerId: string): Promise<PaymentMethodInfo[]>;

    /** List invoices for a customer */
    getInvoices(customerId: string, limit?: number): Promise<InvoiceInfo[]>;

    /** Handle a webhook event from the provider */
    handleWebhook(payload: string, signature: string): Promise<WebhookResult>;

    /** Create a customer in the provider's system */
    createCustomer(params: CreateCustomerParams): Promise<string>;
}

// ============================================================
// CHECKOUT
// ============================================================

export interface CheckoutParams {
    salonId: number;
    planId: string;
    priceId: string;
    customerId?: string;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
}

export interface CheckoutResult {
    url: string;
    sessionId: string;
}

// ============================================================
// PORTAL
// ============================================================

export interface PortalResult {
    url: string;
}

// ============================================================
// CUSTOMER
// ============================================================

export interface CreateCustomerParams {
    salonId: number;
    email: string;
    name: string;
    metadata?: Record<string, string>;
}

// ============================================================
// WEBHOOK
// ============================================================

export interface WebhookResult {
    handled: boolean;
    event: string;
    salonId?: number;
    subscriptionId?: string;
    status?: string;
    action?: string;
    data?: Record<string, unknown>;
}

// ============================================================
// PAYMENT METHODS
// ============================================================

export interface PaymentMethodInfo {
    id: string;
    provider: string;
    type: string;          // 'card', 'bank_account', 'mobile_money', etc.
    last4?: string;
    brand?: string;        // 'visa', 'mastercard', etc.
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
}

// ============================================================
// INVOICES
// ============================================================

export interface InvoiceInfo {
    id: string;
    provider: string;
    amount: number;
    currency: string;
    status: 'paid' | 'open' | 'void' | 'draft' | 'uncollectible';
    date: string;
    pdfUrl?: string;
    hostedUrl?: string;
    description?: string;
}

// ============================================================
// CONFIGURATION
// ============================================================

export interface PaymentConfig {
    providers: string[];
    defaultProvider: string;
    isDemoMode: boolean;
}

// ============================================================
// DATABASE MODELS
// ============================================================

export interface PaymentCustomer {
    id: string;
    salonId: number;
    provider: string;
    customerId: string;
    createdAt: string;
}

export interface PaymentEvent {
    id: string;
    provider: string;
    eventId: string;
    eventType: string;
    salonId?: number;
    payload: Record<string, unknown>;
    processedAt: string;
}
