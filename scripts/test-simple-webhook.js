const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://flumbericoco_user:flumbericoco_password@localhost:5432/flumbericoco_db'
    }
  }
});

async function testSimpleWebhook() {
  try {
    console.log('🧪 Simple Webhook Test\n');

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

    console.log(`✅ Test user: ${user.name} (${user.id})`);
    console.log(`   Current tier: ${user.subscriptionTier}`);

    // 2. Reset to free tier for testing
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'free',
        subscriptionId: null,
        subscriptionEndsAt: null,
      },
    });

    console.log('🔄 Reset to free tier for testing');

    // 3. Send webhook
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
          customer: 'cus_test_simple',
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

    console.log('📤 Sending webhook...');
    const response = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent),
    });

    if (response.ok) {
      console.log('✅ Webhook sent successfully');
    } else {
      console.log('❌ Webhook failed:', response.status);
      console.log('   Error:', await response.text());
      return;
    }

    // 4. Check result
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for processing

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionTier: true,
        subscriptionId: true,
        updatedAt: true
      }
    });

    console.log(`📊 Result: ${updatedUser.subscriptionTier}`);

    if (updatedUser.subscriptionTier === 'pro') {
      console.log('🎉 SUCCESS: Stripe webhook processing works!');
      console.log('   ✅ User upgraded to Pro tier');
      console.log('   ✅ Database updated correctly');
      console.log('   ✅ Integration ready for production');
    } else {
      console.log('❌ FAILED: User not upgraded');
      console.log(`   Expected: pro, Got: ${updatedUser.subscriptionTier}`);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSimpleWebhook();