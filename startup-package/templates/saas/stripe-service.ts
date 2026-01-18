// =============================================================================
// Stripe Service - Multi-Tenant SaaS Billing
// =============================================================================
// Service complet pour gérer la facturation avec Stripe
//
// Features :
// - Création de customers Stripe
// - Gestion des abonnements
// - Webhooks handling
// - Checkout sessions
// - Customer portal
// =============================================================================

import Stripe from 'stripe';

// =============================================================================
// TYPES
// =============================================================================

export interface CreateCustomerParams {
  tenantId: string;
  tenantSlug: string;
  email: string;
  name: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export interface SubscriptionResult {
  subscriptionId: string;
  status: string;
  clientSecret?: string; // Pour PaymentIntent si nécessaire
  currentPeriodEnd: Date;
}

export interface CheckoutSessionParams {
  tenantId: string;
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}

export interface WebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const STRIPE_CONFIG = {
  apiVersion: '2023-10-16' as const,
  prices: {
    starter: process.env.STRIPE_PRICE_STARTER!,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE!,
  },
  trialDays: {
    starter: 14,
    professional: 14,
    enterprise: 30,
  },
};

// =============================================================================
// STRIPE SERVICE
// =============================================================================

export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_CONFIG.apiVersion,
    });
  }

  // ===========================================================================
  // CUSTOMER MANAGEMENT
  // ===========================================================================

  /**
   * Crée un nouveau customer Stripe pour un tenant
   */
  async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        tenant_id: params.tenantId,
        tenant_slug: params.tenantSlug,
        ...params.metadata,
      },
    });

    return customer;
  }

  /**
   * Récupère un customer par son ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        return null;
      }
      return customer as Stripe.Customer;
    } catch (error) {
      return null;
    }
  }

  /**
   * Met à jour un customer
   */
  async updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.update(customerId, params);
  }

  // ===========================================================================
  // SUBSCRIPTION MANAGEMENT
  // ===========================================================================

  /**
   * Crée un nouvel abonnement
   */
  async createSubscription(
    params: CreateSubscriptionParams
  ): Promise<SubscriptionResult> {
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: params.customerId,
      items: [{ price: params.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: params.metadata,
    };

    // Ajouter une période d'essai si spécifiée
    if (params.trialDays && params.trialDays > 0) {
      subscriptionParams.trial_period_days = params.trialDays;
    }

    const subscription = await this.stripe.subscriptions.create(
      subscriptionParams
    );

    // Extraire le client_secret si un paiement est nécessaire
    let clientSecret: string | undefined;
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    if (latestInvoice?.payment_intent) {
      const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
      clientSecret = paymentIntent.client_secret || undefined;
    }

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };
  }

  /**
   * Récupère un abonnement
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Met à jour le plan d'un abonnement (upgrade/downgrade)
   */
  async updateSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    return this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  /**
   * Annule un abonnement
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    if (cancelAtPeriodEnd) {
      // Annuler à la fin de la période
      return this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      // Annulation immédiate
      return this.stripe.subscriptions.cancel(subscriptionId);
    }
  }

  /**
   * Réactive un abonnement annulé (si cancel_at_period_end)
   */
  async reactivateSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  // ===========================================================================
  // CHECKOUT & PORTAL
  // ===========================================================================

  /**
   * Crée une session Checkout pour un nouvel abonnement
   */
  async createCheckoutSession(
    params: CheckoutSessionParams
  ): Promise<Stripe.Checkout.Session> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: params.customerId,
      mode: 'subscription',
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      subscription_data: {
        metadata: {
          tenant_id: params.tenantId,
        },
      },
    };

    // Ajouter une période d'essai
    if (params.trialDays && params.trialDays > 0) {
      sessionParams.subscription_data!.trial_period_days = params.trialDays;
    }

    return this.stripe.checkout.sessions.create(sessionParams);
  }

  /**
   * Crée un lien vers le Customer Portal
   */
  async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  // ===========================================================================
  // INVOICES
  // ===========================================================================

  /**
   * Liste les factures d'un customer
   */
  async listInvoices(
    customerId: string,
    limit: number = 10
  ): Promise<Stripe.Invoice[]> {
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return invoices.data;
  }

  /**
   * Récupère une facture spécifique
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
    try {
      return await this.stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      return null;
    }
  }

  // ===========================================================================
  // PAYMENT METHODS
  // ===========================================================================

  /**
   * Liste les méthodes de paiement d'un customer
   */
  async listPaymentMethods(
    customerId: string
  ): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  }

  /**
   * Définit la méthode de paiement par défaut
   */
  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  // ===========================================================================
  // WEBHOOKS
  // ===========================================================================

  /**
   * Vérifie la signature d'un webhook
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    endpointSecret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret
    );
  }

  /**
   * Handler pour les événements de webhook
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<WebhookHandlerResult> {
    const handlers: Record<string, (data: any) => Promise<WebhookHandlerResult>> = {
      // Subscription events
      'customer.subscription.created': this.handleSubscriptionCreated.bind(this),
      'customer.subscription.updated': this.handleSubscriptionUpdated.bind(this),
      'customer.subscription.deleted': this.handleSubscriptionDeleted.bind(this),
      'customer.subscription.trial_will_end': this.handleTrialWillEnd.bind(this),

      // Invoice events
      'invoice.paid': this.handleInvoicePaid.bind(this),
      'invoice.payment_failed': this.handlePaymentFailed.bind(this),
      'invoice.upcoming': this.handleUpcomingInvoice.bind(this),

      // Customer events
      'customer.updated': this.handleCustomerUpdated.bind(this),
      'customer.deleted': this.handleCustomerDeleted.bind(this),

      // Checkout events
      'checkout.session.completed': this.handleCheckoutCompleted.bind(this),
    };

    const handler = handlers[event.type];

    if (handler) {
      return handler(event.data.object);
    }

    return { handled: false, message: `Unhandled event type: ${event.type}` };
  }

  // ===========================================================================
  // WEBHOOK HANDLERS
  // ===========================================================================

  private async handleSubscriptionCreated(
    subscription: Stripe.Subscription
  ): Promise<WebhookHandlerResult> {
    const tenantId = subscription.metadata.tenant_id;

    // TODO: Mettre à jour le tenant dans la base de données
    // await this.tenantService.updateSubscription(tenantId, {
    //   subscriptionId: subscription.id,
    //   status: this.mapSubscriptionStatus(subscription.status),
    //   plan: this.getPlanFromPrice(subscription.items.data[0].price.id),
    //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    // });

    return {
      handled: true,
      tenantId,
      action: 'subscription_created',
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
      },
    };
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription
  ): Promise<WebhookHandlerResult> {
    const tenantId = subscription.metadata.tenant_id;

    // TODO: Mettre à jour le tenant
    // Gérer les upgrades/downgrades, changements de statut, etc.

    return {
      handled: true,
      tenantId,
      action: 'subscription_updated',
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    };
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription
  ): Promise<WebhookHandlerResult> {
    const tenantId = subscription.metadata.tenant_id;

    // TODO: Downgrader le tenant vers le plan gratuit ou suspendre
    // await this.tenantService.handleSubscriptionCanceled(tenantId);

    return {
      handled: true,
      tenantId,
      action: 'subscription_deleted',
      data: {
        subscriptionId: subscription.id,
      },
    };
  }

  private async handleTrialWillEnd(
    subscription: Stripe.Subscription
  ): Promise<WebhookHandlerResult> {
    const tenantId = subscription.metadata.tenant_id;

    // TODO: Envoyer un email de rappel
    // await this.emailService.sendTrialEndingReminder(tenantId, {
    //   trialEndDate: new Date(subscription.trial_end! * 1000),
    // });

    return {
      handled: true,
      tenantId,
      action: 'trial_will_end',
      data: {
        trialEnd: subscription.trial_end,
      },
    };
  }

  private async handleInvoicePaid(
    invoice: Stripe.Invoice
  ): Promise<WebhookHandlerResult> {
    const tenantId = (invoice.subscription_details?.metadata?.tenant_id ||
      invoice.metadata?.tenant_id) as string;

    // TODO: Marquer la facture comme payée, envoyer un reçu
    // await this.invoiceService.markAsPaid(invoice.id);
    // await this.emailService.sendReceipt(tenantId, invoice);

    return {
      handled: true,
      tenantId,
      action: 'invoice_paid',
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
      },
    };
  }

  private async handlePaymentFailed(
    invoice: Stripe.Invoice
  ): Promise<WebhookHandlerResult> {
    const tenantId = (invoice.subscription_details?.metadata?.tenant_id ||
      invoice.metadata?.tenant_id) as string;

    // TODO: Envoyer un email d'échec de paiement
    // await this.emailService.sendPaymentFailedNotification(tenantId, {
    //   invoiceId: invoice.id,
    //   amount: invoice.amount_due,
    //   nextAttempt: invoice.next_payment_attempt,
    // });

    return {
      handled: true,
      tenantId,
      action: 'payment_failed',
      data: {
        invoiceId: invoice.id,
        attemptCount: invoice.attempt_count,
      },
    };
  }

  private async handleUpcomingInvoice(
    invoice: Stripe.Invoice
  ): Promise<WebhookHandlerResult> {
    // Notification de facture à venir (optionnel)
    return {
      handled: true,
      action: 'upcoming_invoice',
      data: {
        customerId: invoice.customer,
        amount: invoice.amount_due,
      },
    };
  }

  private async handleCustomerUpdated(
    customer: Stripe.Customer
  ): Promise<WebhookHandlerResult> {
    const tenantId = customer.metadata.tenant_id;

    // TODO: Synchroniser les infos client si nécessaire

    return {
      handled: true,
      tenantId,
      action: 'customer_updated',
      data: {
        customerId: customer.id,
        email: customer.email,
      },
    };
  }

  private async handleCustomerDeleted(
    customer: Stripe.DeletedCustomer
  ): Promise<WebhookHandlerResult> {
    // Gérer la suppression du customer Stripe
    return {
      handled: true,
      action: 'customer_deleted',
      data: {
        customerId: customer.id,
      },
    };
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<WebhookHandlerResult> {
    const tenantId = session.metadata?.tenant_id;

    // TODO: Finaliser l'onboarding si c'est un nouveau tenant

    return {
      handled: true,
      tenantId,
      action: 'checkout_completed',
      data: {
        sessionId: session.id,
        subscriptionId: session.subscription,
      },
    };
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  /**
   * Convertit le statut Stripe en statut interne
   */
  private mapSubscriptionStatus(status: Stripe.Subscription.Status): string {
    const mapping: Record<Stripe.Subscription.Status, string> = {
      active: 'ACTIVE',
      canceled: 'CANCELED',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'EXPIRED',
      past_due: 'PAST_DUE',
      paused: 'PAUSED',
      trialing: 'TRIALING',
      unpaid: 'UNPAID',
    };
    return mapping[status] || 'UNKNOWN';
  }

  /**
   * Détermine le plan depuis l'ID du prix
   */
  private getPlanFromPrice(priceId: string): string {
    const priceToplan: Record<string, string> = {
      [STRIPE_CONFIG.prices.starter]: 'STARTER',
      [STRIPE_CONFIG.prices.professional]: 'PROFESSIONAL',
      [STRIPE_CONFIG.prices.enterprise]: 'ENTERPRISE',
    };
    return priceToplan[priceId] || 'FREE';
  }
}

// =============================================================================
// TYPES
// =============================================================================

interface WebhookHandlerResult {
  handled: boolean;
  tenantId?: string;
  action?: string;
  message?: string;
  data?: Record<string, any>;
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let stripeServiceInstance: StripeService | null = null;

export function getStripeService(): StripeService {
  if (!stripeServiceInstance) {
    stripeServiceInstance = new StripeService();
  }
  return stripeServiceInstance;
}
