require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function simulateWebhook() {
  console.log('🔧 Simulating Stripe webhook event...');

  // Simulate checkout.session.completed event
  const event = {
    id: 'evt_test_' + Date.now(),
    object: 'checkout.session.completed',
    api_version: '2025-10-29.clover',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'cs_test_' + Date.now(),
        object: 'checkout.session',
        mode: 'subscription',
        customer: 'cus_test_example',
        customer_email: 'test@example.com',
        subscription: 'sub_test_' + Date.now(),
        metadata: {
          userId: '1', // Change this to actual user ID if needed
        },
        success_url: 'http://localhost:3000/dashboard?success=true',
        cancel_url: 'http://localhost:3000/upgrade?canceled=true'
      }
    }
  };

  try {
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
      console.log('   Event type:', event.type);
      console.log('   User ID:', event.data.object.metadata?.userId);
      console.log('   Check dashboard for subscription update');
    } else {
      console.error('❌ Failed to send webhook:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error sending webhook:', error);
  }
}

// Run simulation
simulateWebhook();