const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://flumbericoco_user:flumbericoco_password@localhost:5432/flumbericoco_db'
    }
  }
});

async function testAPIEndpoints() {
  try {
    console.log('🧪 Testing API Endpoints Integration...\n');

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

    // 2. Test creating a checkout session via API
    console.log('🛒 Testing checkout session creation via API...');

    try {
      const response = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          successUrl: 'http://localhost:3000/dashboard?success=true',
          cancelUrl: 'http://localhost:3000/upgrade?canceled=true'
        }),
      });

      if (response.ok) {
        const session = await response.json();
        console.log(`✅ API checkout session created successfully`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   URL: ${session.url}`);
        console.log(`   User ID in metadata: ${session.metadata?.userId || 'not found'}\n`);
      } else {
        console.log('❌ Failed to create API checkout session');
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${await response.text()}\n`);
        return;
      }
    } catch (error) {
      console.log('❌ Error calling checkout API:', error.message);
      return;
    }

    // 3. Reset user to free tier for testing
    console.log('🔄 Resetting user to free tier for webhook test...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'free',
        subscriptionId: null,
        subscriptionEndsAt: null,
      },
    });
    console.log('✅ User reset to free tier\n');

    // 4. Test webhook processing
    console.log('🪝 Testing webhook processing via API...');
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
      const webhookResponse = await fetch('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEvent),
      });

      if (webhookResponse.ok) {
        console.log('✅ Webhook API call successful');
        console.log(`   Response: ${await webhookResponse.text()}\n`);
      } else {
        console.log('❌ Webhook API call failed');
        console.log(`   Status: ${webhookResponse.status}`);
        console.log(`   Error: ${await webhookResponse.text()}\n`);
        return;
      }
    } catch (error) {
      console.log('❌ Error calling webhook API:', error.message);
      return;
    }

    // 5. Verify final database state
    console.log('📊 Final database state after webhook:');
    const finalUser = await prisma.user.findUnique({
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

    console.log(`   Subscription tier: ${finalUser.subscriptionTier}`);
    console.log(`   Subscription ID: ${finalUser.subscriptionId || 'null'}`);
    console.log(`   Subscription ends: ${finalUser.subscriptionEndsAt || 'null'}`);
    console.log(`   Last updated: ${finalUser.updatedAt}\n`);

    // 6. Final verification
    if (finalUser.subscriptionTier === 'pro') {
      console.log('🎉 SUCCESS: Full Stripe API integration is working!');
      console.log('   ✅ Users can create checkout sessions via API');
      console.log('   ✅ Webhook API processes events correctly');
      console.log('   ✅ Database is updated with Pro subscription');
      console.log('   ✅ Ready for real payments!\n');

      console.log('📋 Test Summary:');
      console.log(`   • User: ${finalUser.name}`);
      console.log(`   • Email: ${finalUser.email}`);
      console.log(`   • Before: free tier`);
      console.log(`   • After: ${finalUser.subscriptionTier} tier`);
      console.log(`   • Subscription ID: ${finalUser.subscriptionId || 'none'}`);
      console.log(`   • Ready for production: ✅\n`);
    } else {
      console.log('❌ FAILURE: Subscription was not updated after webhook');
      console.log(`   Expected: pro, Got: ${finalUser.subscriptionTier}\n`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAPIEndpoints();