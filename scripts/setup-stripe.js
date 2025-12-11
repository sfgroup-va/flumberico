require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripe() {
  try {
    console.log('🚀 Setting up Stripe for Flumbericoco Pro...');

    // 1. Create Product
    console.log('📦 Creating product...');
    const product = await stripe.products.create({
      name: 'Flumbericoco Pro',
      description: 'AI-powered job hunting automation with unlimited applications and advanced analytics',
      images: [],
      metadata: {
        app: 'flumbericoco',
        tier: 'pro'
      }
    });
    console.log(`✅ Product created: ${product.id}`);

    // 2. Create Price (Monthly)
    console.log('💰 Creating monthly price ($29)...');
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 2900, // $29.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      nickname: 'Pro Plan - Monthly',
      metadata: {
        app: 'flumbericoco',
        tier: 'pro',
        billing: 'monthly'
      }
    });
    console.log(`✅ Monthly price created: ${monthlyPrice.id}`);
    console.log(`   Price: $${monthlyPrice.unit_amount / 100}/${monthlyPrice.recurring.interval}`);

    // 3. Create Price (Annual - 2 months free = $290 for 12 months)
    console.log('💰 Creating annual price ($290/year)...');
    const annualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 29000, // $290.00 in cents (2 months free)
      currency: 'usd',
      recurring: {
        interval: 'year',
        interval_count: 1
      },
      nickname: 'Pro Plan - Annual (Save $58)',
      metadata: {
        app: 'flumbericoco',
        tier: 'pro',
        billing: 'annual'
      }
    });
    console.log(`✅ Annual price created: ${annualPrice.id}`);
    console.log(`   Price: $${annualPrice.unit_amount / 100}/${annualPrice.recurring.interval}`);

    // 4. Create Webhook Endpoint
    console.log('🪝 Creating webhook endpoint...');
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: 'http://localhost:3000/api/stripe/webhook',
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'checkout.session.completed'
      ],
      description: 'Flumbericoco Pro subscription webhooks'
    });
    console.log(`✅ Webhook endpoint created: ${webhookEndpoint.id}`);
    console.log(`   Webhook Secret: ${webhookEndpoint.secret}`);

    // 5. Print summary
    console.log('\n🎉 Stripe setup complete!');
    console.log('\n📋 Add these to your .env file:');
    console.log('----------------------------------------');
    console.log(`STRIPE_PRO_PRICE_ID="${monthlyPrice.id}"`);
    console.log(`STRIPE_PRO_ANNUAL_PRICE_ID="${annualPrice.id}"`);
    console.log(`STRIPE_WEBHOOK_SECRET="${webhookEndpoint.secret}"`);
    console.log('----------------------------------------');
    console.log('\n💡 You can also set up webhooks manually:');
    console.log(`   URL: http://localhost:3000/api/stripe/webhook`);
    console.log(`   Secret: ${webhookEndpoint.secret}`);
    console.log('\n🔗 Stripe Dashboard Links:');
    console.log(`   Product: https://dashboard.stripe.com/products/${product.id}`);
    console.log(`   Prices: https://dashboard.stripe.com/products/${product.id}/prices`);
    console.log(`   Webhooks: https://dashboard.stripe.com/webhooks`);

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    process.exit(1);
  }
}

setupStripe();