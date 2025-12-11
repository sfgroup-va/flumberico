import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCustomerPortalParams {
  customerId: string;
  returnUrl: string;
}

export class StripeService {
  /**
   * Create a Stripe checkout session for subscription
   */
  static async createCheckoutSession({
    userId,
    userEmail,
    successUrl,
    cancelUrl
  }: CreateCheckoutSessionParams) {
    try {
      // Get or create Stripe customer
      let customerId = await this.getOrCreateCustomer(userId, userEmail);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: process.env.STRIPE_PRO_PRICE_ID, // Pro subscription price ID
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        customer_update: {
          address: 'auto',
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Create a customer portal session for managing subscriptions
   */
  static async createCustomerPortal({
    customerId,
    returnUrl
  }: CreateCustomerPortalParams) {
    try {
      // Note: This method is disabled for now due to API version issues
      // In production, use proper Stripe API version that supports billing portal
      throw new Error('Customer portal feature temporarily disabled');

      // Future implementation:
      // const session = await stripe.billing.portal.sessions.create({
      //   customer: customerId,
      //   return_url: returnUrl,
      // });
      // return session;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionChange(event);
          break;
        case 'invoice.payment_succeeded':
          // await this.handlePaymentSucceeded(event);
          console.log('Payment succeeded webhook received (handling disabled)');
          break;
        case 'invoice.payment_failed':
          // await this.handlePaymentFailed(event);
          console.log('Payment failed webhook received (handling disabled)');
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error handling webhook event ${event.type}:`, error);
    }
  }

  /**
   * Handle subscription changes
   */
  private static async handleSubscriptionChange(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    // Import prisma dynamically to avoid module issues
    const prisma = await import('./prisma');

    // Get subscription details
    const isPro = subscription.status === 'active' || subscription.status === 'trialing';
    const subscriptionId = subscription.id;
    const subscriptionEndsAt = 'current_period_end' in subscription && subscription.current_period_end
      ? new Date((subscription.current_period_end as number) * 1000)
      : null;

    // Update user in database
    await prisma.default.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: isPro ? 'pro' : 'free',
        subscriptionId,
        subscriptionEndsAt,
        updatedAt: new Date(),
      },
    });

    console.log(`Updated user ${userId} subscription to ${isPro ? 'pro' : 'free'}`);
  }

  /**
   * Handle successful payments (placeholder - temporarily disabled)
   */
  private static handlePaymentSucceeded() {
    console.log('Payment webhook handling temporarily disabled');
  }

  /**
   * Handle failed payments (placeholder - temporarily disabled)
   */
  private static handlePaymentFailed() {
    console.log('Payment webhook handling temporarily disabled');
  }

  /**
   * Handle checkout completion
   */
  private static async handleCheckoutCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error('No userId found in checkout session metadata');
      return;
    }

    console.log(`✅ Checkout completed for user ${userId}`);

    // Immediately update user subscription to pro
    const prisma = await import('./prisma');

    try {
      await prisma.default.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'pro',
          updatedAt: new Date(),
        },
      });
      console.log(`✅ User ${userId} upgraded to Pro tier`);
    } catch (error) {
      console.error('❌ Error updating user subscription:', error);
    }

    // Store subscription details if available
    if (session.subscription) {
      try {
        await prisma.default.user.update({
          where: { id: userId },
          data: {
            subscriptionId: session.subscription as string,
          },
        });
      } catch (error) {
        console.error('Error updating subscription ID:', error);
      }
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  /**
   * Get customer's active subscriptions
   */
  static async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
      });

      return subscriptions.data;
    } catch (error) {
      console.error('Error retrieving customer subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get or create a Stripe customer
   */
  private static async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    try {
      // Try to find existing customer
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        return customers.data[0].id;
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });

      return customer.id;
    } catch (error) {
      console.error('Error getting/creating customer:', error);
      throw error;
    }
  }
}

export default stripe;