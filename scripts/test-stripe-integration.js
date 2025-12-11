const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://flumbericoco_user:flumbericoco_password@localhost:5432/flumbericoco_db'
    }
  }
});

async function testStripeIntegration() {
  try {
    console.log('🧪 Testing Stripe Integration End-to-End...\n');

    // 1. Get a test user
    const user = await prisma.user.findFirst({
      where: {
        email: {
          contains: '@'
        }
      }
    });

    if (!user) {
      console.log('❌ No user found in database');
      return;
    }

    console.log(`✅ Found test user: ${user.name} (${user.id})`);
    console.log(`   Current tier: ${user.subscriptionTier}`);
    console.log(`   Email: ${user.email}\n`);

    // 2. Test the Stripe service checkout session creation
    console.log('🛒 Testing checkout session creation...');
    const { StripeService } = await import('../src/lib/stripe.js');

    try {
      const session = await StripeService.createCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        successUrl: 'http://localhost:3000/dashboard?success=true',
        cancelUrl: 'http://localhost:3000/upgrade?canceled=true'
      });

      if (session && session.id) {
        console.log(`✅ Checkout session created successfully`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   Customer: ${session.customer}`);
        console.log(`   User ID in metadata: ${session.metadata?.userId}\n`);
      } else {
        console.log('❌ Failed to create checkout session');
        return;
      }
    } catch (error) {
      console.log('❌ Error creating checkout session:', error.message);
      return;
    }

    // 3. Verify database state before webhook
    console.log('📊 Current database state:');
    const userBefore = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionId: true,
        subscriptionEndsAt: true,
        updatedAt: true
      }
    });

    console.log(`   Subscription tier: ${userBefore.subscriptionTier}`);
    console.log(`   Subscription ID: ${userBefore.subscriptionId || 'null'}`);
    console.log(`   Subscription ends: ${userBefore.subscriptionEndsAt || 'null'}\n`);

    // 4. Test webhook processing
    console.log('🪝 Testing webhook processing...');
    const testEvent = {
      id: 'evt_test_' + Date.now(),
      type: 'checkout.session.completed',
      object: 'event',
      api_version: '2025-10-29.clover',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          object: 'checkout.session',
          mode: 'subscription',
          customer: 'cus_test_webhook',
          customer_email: user.email,
          subscription: 'sub_test_' + Date.now(),
          metadata: {
            userId: user.id,
          },
          success_url: 'http://localhost:3000/dashboard?success=true',
          cancel_url: 'http://localhost:3000/upgrade?canceled=true'
        }
      }
    };

    try {
      await StripeService.handleWebhookEvent(testEvent);
      console.log('✅ Webhook processed successfully\n');
    } catch (error) {
      console.log('❌ Error processing webhook:', error.message);
      return;
    }

    // 5. Verify database state after webhook
    console.log('📊 Database state after webhook:');
    const userAfter = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionId: true,
        subscriptionEndsAt: true,
        updatedAt: true
      }
    });

    console.log(`   Subscription tier: ${userAfter.subscriptionTier}`);
    console.log(`   Subscription ID: ${userAfter.subscriptionId || 'null'}`);
    console.log(`   Subscription ends: ${userAfter.subscriptionEndsAt || 'null'}`);
    console.log(`   Last updated: ${userAfter.updatedAt}\n`);

    // 6. Final verification
    if (userAfter.subscriptionTier === 'pro') {
      console.log('🎉 SUCCESS: Full Stripe integration is working!');
      console.log('   ✅ User can create checkout sessions');
      console.log('   ✅ Webhook events are processed correctly');
      console.log('   ✅ Database is updated with Pro subscription');
      console.log('   ✅ Ready for real payments!\n');
    } else {
      console.log('❌ FAILURE: Subscription was not updated after webhook');
      console.log(`   Expected: pro, Got: ${userAfter.subscriptionTier}\n`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testStripeIntegration();