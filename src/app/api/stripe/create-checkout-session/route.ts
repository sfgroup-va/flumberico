import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StripeService } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, userEmail, successUrl, cancelUrl } = body;

    // Validate required fields
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userEmail' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const stripeSession = await StripeService.createCheckoutSession({
      userId,
      userEmail,
      successUrl: successUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancelUrl: cancelUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/upgrade?canceled=true`
    });

    return NextResponse.json({
      id: stripeSession.id,
      url: stripeSession.url,
      customer_email: stripeSession.customer_email,
      metadata: stripeSession.metadata
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}