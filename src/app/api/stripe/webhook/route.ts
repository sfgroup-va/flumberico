import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { StripeService } from '@/lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🪝 Webhook received:', body.type);

    // For development, skip signature verification
    // In production, enable proper webhook verification
    if (process.env.NODE_ENV === 'production') {
      const textBody = await request.text();
      const requestHeaders = request.headers;
      const signature = requestHeaders.get('stripe-signature');

      if (!signature) {
        return NextResponse.json(
          { error: 'Missing stripe signature' },
          { status: 400 }
        );
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(textBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }

      // Handle the event
      await StripeService.handleWebhookEvent(event);
    } else {
      // Development mode - handle without verification
      await StripeService.handleWebhookEvent(body);
    }

    // Return 200 OK to acknowledge receipt of the event
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}