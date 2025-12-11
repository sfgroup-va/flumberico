require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://flumbericoco_user:flumbericoco_password@localhost:5432/flumbericoco_db'
    }
  }
});

async function simulateWebhook() {
  try {
    console.log('🔧 Getting user from database...');

    // Get a user from database
    const user = await prisma.user.findFirst({
      where: {
        email: {
          contains: '@' // Find any user with email
        }
      }
    });

    if (!user) {
      console.log('❌ No user found in database');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.id})`);
    console.log(`   Current tier: ${user.subscriptionTier}`);

    // Simulate checkout.session.completed event
    const event = {
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
          customer: 'cus_test_example',
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

    console.log('📤 Simulating webhook event:', event.type);
    console.log('   User ID:', event.data.object.metadata?.userId);

    // Send to our webhook endpoint
    const response = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      console.log('✅ Webhook simulation sent successfully');

      // Verify the update
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      console.log(`✅ User subscription updated: ${updatedUser?.subscriptionTier}`);

      if (updatedUser?.subscriptionTier === 'pro') {
        console.log('🎉 SUCCESS: User is now PRO!');
      }
    } else {
      console.error('❌ Failed to send webhook:', await response.text());
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run simulation
simulateWebhook();