require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createWebhookEndpoint() {
  try {
    console.log('🪝 Creating webhook endpoint for ngrok/tunnel...');

    // Untuk development, Anda perlu tunneling service seperti ngrok
    // Ini akan gagal untuk localhost, tapi kita dapat membuat manual

    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: 'https://your-tunnel-url.ngrok.io/api/stripe/webhook', // Ganti dengan tunnel URL Anda
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'checkout.session.completed'
      ],
      description: 'Flumbericoco Pro subscription webhooks - Development'
    });

    console.log(`✅ Webhook endpoint created: ${webhookEndpoint.id}`);
    console.log(`🔑 Webhook Secret: ${webhookEndpoint.secret}`);
    console.log('\n📝 Update your .env with:');
    console.log(`STRIPE_WEBHOOK_SECRET="${webhookEndpoint.secret}"`);

  } catch (error) {
    console.error('❌ Error creating webhook:', error.message);
    console.log('\n💡 For local development, you have two options:');
    console.log('1. Install Stripe CLI: https://github.com/stripe/stripe-cli');
    console.log('2. Use ngrok: https://ngrok.com/');
    console.log('\n🔧 Option 1 - Stripe CLI:');
    console.log('   stripe listen --forward-to localhost:3000/api/stripe/webhook');
    console.log('\n🔧 Option 2 - Ngrok:');
    console.log('   ngrok http 3000');
    console.log('   Then use the ngrok URL to create webhook manually');
  }
}

createWebhookEndpoint();