const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySubscriptionData() {
  try {
    console.log('🔍 Verifying subscription plans data...\n');

    // Count plans
    const totalPlans = await prisma.subscriptionPlan.count();
    console.log(`📊 Total subscription plans: ${totalPlans}`);

    if (totalPlans > 0) {
      // Get all plans
      const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { price: 'asc' }
      });

      console.log('\n📋 Subscription Plans:');
      plans.forEach(plan => {
        console.log(`\n✅ ${plan.name} Plan:`);
        console.log(`   ID: ${plan.planId}`);
        console.log(`   Price: $${(plan.price / 100).toFixed(2)}/${plan.interval}`);
        console.log(`   Active: ${plan.active ? 'Yes' : 'No'}`);
        console.log(`   Stripe Price ID: ${plan.stripePriceId || 'Not set'}`);
        console.log(`   Features: ${Array.isArray(plan.features) ? plan.features.length : 0} items`);
        console.log(`   Created: ${plan.createdAt.toLocaleString()}`);
      });

      // Check specific Pro plan pricing
      const proPlan = plans.find(p => p.planId === 'pro');
      if (proPlan) {
        console.log(`\n💰 Current Pro Plan Price: $${(proPlan.price / 100).toFixed(2)}/${proPlan.interval}`);
        console.log(`🔄 Last Updated: ${proPlan.updatedAt.toLocaleString()}`);
      }
    } else {
      console.log('❌ No subscription plans found in database');
    }

    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('\n✅ Database connection verified');

  } catch (error) {
    console.error('❌ Error verifying subscription data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySubscriptionData();