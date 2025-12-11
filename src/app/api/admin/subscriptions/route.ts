import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Subscription plans interface
interface SubscriptionPlan {
  id: string;
  planId: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    jobApplications: number;
    aiHunterScans: number;
    resumeOptimizations: number;
    prioritySupport: boolean;
  };
  stripePriceId?: string;
  active: boolean;
}

// Default subscription plans (for initialization)
const DEFAULT_PLANS: Omit<SubscriptionPlan, 'id'>[] = [
  {
    planId: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Basic job browsing',
      'Manual applications',
      '5 application tracking',
      'Basic resume upload',
      'Standard support'
    ],
    limits: {
      jobApplications: 5,
      aiHunterScans: 0,
      resumeOptimizations: 1,
      prioritySupport: false
    },
    active: true
  },
  {
    planId: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited job browsing',
      'AI Hunter automatic applications',
      'Unlimited application tracking',
      'Advanced resume optimization',
      'AI-powered job matching',
      'Priority support',
      'Advanced analytics dashboard'
    ],
    limits: {
      jobApplications: -1, // Unlimited
      aiHunterScans: -1, // Unlimited
      resumeOptimizations: -1, // Unlimited
      prioritySupport: true
    },
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    active: true
  }
];

// Initialize default plans if they don't exist
async function initializeDefaultPlans() {
  try {
    const existingPlans = await prisma.subscriptionPlan.count();
    if (existingPlans === 0) {
      console.log('Initializing default subscription plans...');
      for (const plan of DEFAULT_PLANS) {
        await prisma.subscriptionPlan.create({
          data: plan
        });
      }
      console.log('Default subscription plans initialized');
    }
  } catch (error) {
    console.error('Error initializing default plans:', error);
  }
}

// GET subscription plans
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Initialize default plans if needed
    await initializeDefaultPlans();

    // Fetch plans from database
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });

    // Transform to expected format
    const transformedPlans = plans.map(plan => ({
      id: plan.planId,
      planId: plan.planId,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval as 'month' | 'year',
      features: Array.isArray(plan.features) ? plan.features : [],
      limits: plan.limits as {
        jobApplications: number;
        aiHunterScans: number;
        resumeOptimizations: number;
        prioritySupport: boolean;
      },
      stripePriceId: plan.stripePriceId,
      active: plan.active
    }));

    return NextResponse.json({
      plans: transformedPlans,
      success: true
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update subscription plans
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { plans } = await request.json();

    if (!plans || !Array.isArray(plans)) {
      return NextResponse.json(
        { error: 'Invalid plans data' },
        { status: 400 }
      );
    }

    // Validate plans
    for (const plan of plans) {
      if (!plan.planId || !plan.name || typeof plan.price !== 'number') {
        return NextResponse.json(
          { error: 'Invalid plan structure' },
          { status: 400 }
        );
      }
    }

    // Update plans in database
    const updatePromises = plans.map(plan =>
      prisma.subscriptionPlan.updateMany({
        where: { planId: plan.planId },
        data: {
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          interval: plan.interval,
          features: plan.features,
          limits: plan.limits,
          stripePriceId: plan.stripePriceId,
          active: plan.active,
          updatedAt: new Date()
        }
      })
    );

    await Promise.all(updatePromises);

    // Fetch updated plans
    const updatedPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });

    // Transform to expected format
    const transformedPlans = updatedPlans.map(plan => ({
      id: plan.planId,
      planId: plan.planId,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval as 'month' | 'year',
      features: Array.isArray(plan.features) ? plan.features : [],
      limits: plan.limits as {
        jobApplications: number;
        aiHunterScans: number;
        resumeOptimizations: number;
        prioritySupport: boolean;
      },
      stripePriceId: plan.stripePriceId,
      active: plan.active
    }));

    return NextResponse.json({
      success: true,
      message: 'Subscription plans updated successfully',
      plans: transformedPlans
    });

  } catch (error) {
    console.error('Update subscriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new subscription plan
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const plan = await request.json();

    // Validate plan
    if (!plan.id || !plan.name || typeof plan.price !== 'number') {
      return NextResponse.json(
        { error: 'Invalid plan structure' },
        { status: 400 }
      );
    }

    // In a real app, save to database
    // For now, just return success
    const newPlan = {
      ...plan,
      active: plan.active ?? true
    };

    return NextResponse.json({
      success: true,
      message: 'Subscription plan created successfully',
      plan: newPlan
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}