/**
 * Stripe Payment Provider
 *
 * Full implementation of IPaymentProvider using Stripe.
 * Based on startup-package/templates/saas/stripe-service.ts
 */

import Stripe from 'stripe';
import type {
    IPaymentProvider,
    CheckoutParams,
    CheckoutResult,
    OneTimeCheckoutParams,
    PortalResult,
    CreateCustomerParams,
    PaymentMethodInfo,
    InvoiceInfo,
    WebhookResult,
} from '@/types/payment';
import { getStripeConfig } from '../config';

export class StripeProvider implements IPaymentProvider {
    readonly name = 'stripe';
    readonly displayName = 'Stripe';
    private stripe: Stripe;
    private webhookSecret: string;

    constructor() {
        const config = getStripeConfig();
        if (!config.secretKey) {
            throw new Error('STRIPE_SECRET_KEY is required for Stripe provider');
        }
        this.stripe = new Stripe(config.secretKey, {
            apiVersion: '2026-02-25.clover',
        });
        this.webhookSecret = config.webhookSecret;
    }

    // =========================================================================
    // CUSTOMER
    // =========================================================================

    async createCustomer(params: CreateCustomerParams): Promise<string> {
        const customer = await this.stripe.customers.create({
            email: params.email,
            name: params.name,
            metadata: {
                salon_id: String(params.salonId),
                ...params.metadata,
            },
        });
        return customer.id;
    }

    // =========================================================================
    // CHECKOUT
    // =========================================================================

    async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: 'subscription',
            line_items: [{ price: params.priceId, quantity: 1 }],
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            subscription_data: {
                metadata: {
                    salon_id: String(params.salonId),
                    plan_id: params.planId,
                },
            },
            metadata: {
                salon_id: String(params.salonId),
                plan_id: params.planId,
            },
        };

        // Attach existing customer or collect email
        if (params.customerId) {
            sessionParams.customer = params.customerId;
        } else {
            sessionParams.customer_email = params.customerEmail;
        }

        // Trial period
        if (params.trialDays && params.trialDays > 0) {
            sessionParams.subscription_data!.trial_period_days = params.trialDays;
        }

        const session = await this.stripe.checkout.sessions.create(sessionParams);

        return {
            url: session.url!,
            sessionId: session.id,
        };
    }

    /**
     * One-time payment (booking deposit). The booking id travels in the session metadata
     * and comes back in the checkout.session.completed webhook.
     */
    async createOneTimeCheckout(params: OneTimeCheckoutParams): Promise<CheckoutResult> {
        const zeroDecimal = ['JPY', 'KRW', 'XOF', 'XAF', 'CLP', 'VND', 'UGX', 'RWF', 'GNF', 'BIF', 'DJF', 'KMF', 'MGA', 'PYG', 'VUV', 'XPF'];
        const currency = params.currency.toLowerCase();
        const unitAmount = zeroDecimal.includes(currency.toUpperCase())
            ? Math.round(params.amount)
            : Math.round(params.amount * 100);

        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [{
                quantity: 1,
                price_data: {
                    currency,
                    unit_amount: unitAmount,
                    product_data: { name: params.description },
                },
            }],
            customer_email: params.customerEmail,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: {
                kind: 'booking_deposit',
                salon_id: String(params.salonId),
                booking_id: String(params.bookingId),
            },
            payment_intent_data: {
                metadata: {
                    kind: 'booking_deposit',
                    salon_id: String(params.salonId),
                    booking_id: String(params.bookingId),
                },
            },
        });

        return {
            url: session.url!,
            sessionId: session.id,
        };
    }

    // =========================================================================
    // PORTAL
    // =========================================================================

    async createPortalSession(customerId: string, returnUrl: string): Promise<PortalResult> {
        const session = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
        return { url: session.url };
    }

    // =========================================================================
    // SUBSCRIPTIONS
    // =========================================================================

    async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<void> {
        if (cancelAtPeriodEnd) {
            await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
        } else {
            await this.stripe.subscriptions.cancel(subscriptionId);
        }
    }

    // =========================================================================
    // PAYMENT METHODS
    // =========================================================================

    async getPaymentMethods(customerId: string): Promise<PaymentMethodInfo[]> {
        const methods = await this.stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });

        // Get default payment method
        const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
        const defaultPmId = typeof customer.invoice_settings?.default_payment_method === 'string'
            ? customer.invoice_settings.default_payment_method
            : customer.invoice_settings?.default_payment_method?.id;

        return methods.data.map(pm => ({
            id: pm.id,
            provider: 'stripe',
            type: 'card',
            last4: pm.card?.last4,
            brand: pm.card?.brand,
            expiryMonth: pm.card?.exp_month,
            expiryYear: pm.card?.exp_year,
            isDefault: pm.id === defaultPmId,
        }));
    }

    // =========================================================================
    // INVOICES
    // =========================================================================

    async getInvoices(customerId: string, limit = 10): Promise<InvoiceInfo[]> {
        const invoices = await this.stripe.invoices.list({
            customer: customerId,
            limit,
        });

        return invoices.data.map(inv => ({
            id: inv.id,
            provider: 'stripe',
            amount: (inv.amount_paid || inv.amount_due || 0) / 100, // Stripe uses cents
            currency: inv.currency?.toUpperCase() || 'EUR',
            status: this.mapInvoiceStatus(inv.status),
            date: new Date(inv.created * 1000).toISOString(),
            pdfUrl: inv.invoice_pdf || undefined,
            hostedUrl: inv.hosted_invoice_url || undefined,
            description: inv.description || undefined,
        }));
    }

    private mapInvoiceStatus(status: string | null): InvoiceInfo['status'] {
        switch (status) {
            case 'paid': return 'paid';
            case 'open': return 'open';
            case 'void': return 'void';
            case 'draft': return 'draft';
            case 'uncollectible': return 'uncollectible';
            default: return 'open';
        }
    }

    // =========================================================================
    // WEBHOOKS
    // =========================================================================

    async handleWebhook(payload: string, signature: string): Promise<WebhookResult> {
        if (!this.webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is required');
        }

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
        } catch (err) {
            throw new Error(`Webhook signature verification failed: ${(err as Error).message}`);
        }

        const handlers: Record<string, (data: Stripe.Event.Data.Object) => WebhookResult> = {
            'checkout.session.completed': (data) => {
                const session = data as Stripe.Checkout.Session;
                const salonId = session.metadata?.salon_id ? Number(session.metadata.salon_id) : undefined;

                // Booking deposit (one-time payment)
                if (session.metadata?.kind === 'booking_deposit' && session.metadata.booking_id) {
                    return {
                        handled: true,
                        event: 'checkout.session.completed',
                        salonId,
                        action: session.payment_status === 'paid' ? 'booking_deposit_paid' : 'booking_deposit_pending',
                        data: {
                            sessionId: session.id,
                            bookingId: Number(session.metadata.booking_id),
                            amountTotal: (session.amount_total || 0) / 100,
                            paymentStatus: session.payment_status,
                        },
                    };
                }

                return {
                    handled: true,
                    event: 'checkout.session.completed',
                    salonId,
                    subscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
                    action: 'checkout_completed',
                    data: {
                        sessionId: session.id,
                        planId: session.metadata?.plan_id,
                    },
                };
            },

            'checkout.session.async_payment_succeeded': (data) => {
                const session = data as Stripe.Checkout.Session;
                return {
                    handled: session.metadata?.kind === 'booking_deposit',
                    event: 'checkout.session.async_payment_succeeded',
                    salonId: session.metadata?.salon_id ? Number(session.metadata.salon_id) : undefined,
                    action: 'booking_deposit_paid',
                    data: {
                        sessionId: session.id,
                        bookingId: session.metadata?.booking_id ? Number(session.metadata.booking_id) : undefined,
                    },
                };
            },

            'checkout.session.async_payment_failed': (data) => {
                const session = data as Stripe.Checkout.Session;
                return {
                    handled: session.metadata?.kind === 'booking_deposit',
                    event: 'checkout.session.async_payment_failed',
                    salonId: session.metadata?.salon_id ? Number(session.metadata.salon_id) : undefined,
                    action: 'booking_deposit_failed',
                    data: {
                        sessionId: session.id,
                        bookingId: session.metadata?.booking_id ? Number(session.metadata.booking_id) : undefined,
                    },
                };
            },

            'customer.subscription.updated': (data) => {
                const sub = data as Stripe.Subscription;
                // Use type assertion for fields that may differ across API versions
                const rawSub = sub as unknown as Record<string, unknown>;
                const periodEnd = rawSub.current_period_end as number | undefined;
                return {
                    handled: true,
                    event: 'customer.subscription.updated',
                    salonId: sub.metadata?.salon_id ? Number(sub.metadata.salon_id) : undefined,
                    subscriptionId: sub.id,
                    status: this.mapSubscriptionStatus(sub.status),
                    action: 'subscription_updated',
                    data: {
                        cancelAtPeriodEnd: sub.cancel_at_period_end,
                        ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000).toISOString() } : {}),
                    },
                };
            },

            'customer.subscription.deleted': (data) => {
                const sub = data as Stripe.Subscription;
                return {
                    handled: true,
                    event: 'customer.subscription.deleted',
                    salonId: sub.metadata?.salon_id ? Number(sub.metadata.salon_id) : undefined,
                    subscriptionId: sub.id,
                    status: 'canceled',
                    action: 'subscription_deleted',
                };
            },

            'invoice.paid': (data) => {
                const invoice = data as Stripe.Invoice;
                // Extract salon_id from parent subscription details or invoice metadata
                const rawInvoice = invoice as unknown as Record<string, unknown>;
                const subDetails = rawInvoice.subscription_details as Record<string, unknown> | undefined;
                const subMeta = subDetails?.metadata as Record<string, string> | undefined;
                const salonId = subMeta?.salon_id ||
                    (invoice.metadata as Record<string, string>)?.salon_id;
                return {
                    handled: true,
                    event: 'invoice.paid',
                    salonId: salonId ? Number(salonId) : undefined,
                    action: 'invoice_paid',
                    data: {
                        invoiceId: invoice.id,
                        amountPaid: invoice.amount_paid / 100,
                    },
                };
            },

            'invoice.payment_failed': (data) => {
                const invoice = data as Stripe.Invoice;
                const rawInvoice = invoice as unknown as Record<string, unknown>;
                const subDetails = rawInvoice.subscription_details as Record<string, unknown> | undefined;
                const subMeta = subDetails?.metadata as Record<string, string> | undefined;
                const salonId = subMeta?.salon_id ||
                    (invoice.metadata as Record<string, string>)?.salon_id;
                return {
                    handled: true,
                    event: 'invoice.payment_failed',
                    salonId: salonId ? Number(salonId) : undefined,
                    action: 'payment_failed',
                    data: {
                        invoiceId: invoice.id,
                        attemptCount: invoice.attempt_count,
                    },
                };
            },
        };

        const handler = handlers[event.type];
        if (handler) {
            return handler(event.data.object);
        }

        return {
            handled: false,
            event: event.type,
            action: 'unhandled',
        };
    }

    private mapSubscriptionStatus(status: Stripe.Subscription.Status): string {
        const mapping: Record<Stripe.Subscription.Status, string> = {
            active: 'active',
            canceled: 'canceled',
            incomplete: 'incomplete',
            incomplete_expired: 'expired',
            past_due: 'past_due',
            paused: 'paused',
            trialing: 'trialing',
            unpaid: 'unpaid',
        };
        return mapping[status] || 'unknown';
    }
}
