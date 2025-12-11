#!/usr/bin/env node

/**
 * Deployment Helper Script
 * Membantu setup environment variables dan deployment ke Vercel
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

async function main() {
    log.title('🚀 Flumberico Deployment Helper');

    console.log('Panduan ini akan membantu Anda setup deployment ke Vercel.\n');

    // Check if Vercel CLI is installed
    try {
        execSync('vercel --version', { stdio: 'ignore' });
        log.success('Vercel CLI sudah terinstall');
    } catch (error) {
        log.warning('Vercel CLI belum terinstall');
        const install = await question('Install Vercel CLI sekarang? (y/n): ');
        if (install.toLowerCase() === 'y') {
            log.info('Installing Vercel CLI...');
            execSync('npm install -g vercel', { stdio: 'inherit' });
            log.success('Vercel CLI berhasil diinstall');
        } else {
            log.error('Vercel CLI diperlukan untuk deployment');
            process.exit(1);
        }
    }

    // Collect environment variables
    log.title('📝 Setup Environment Variables');

    const envVars = {};

    // Database
    log.info('Database Configuration (Supabase/Neon/Railway)');
    envVars.DATABASE_URL = await question('DATABASE_URL (connection pooler): ');
    envVars.DIRECT_URL = await question('DIRECT_URL (direct connection): ');

    // NextAuth
    log.info('\nNextAuth Configuration');
    const appUrl = await question('App URL (e.g., https://flumberico.vercel.app): ');
    envVars.NEXTAUTH_URL = appUrl;
    envVars.NEXT_PUBLIC_APP_URL = appUrl;

    const hasSecret = await question('Sudah punya NEXTAUTH_SECRET? (y/n): ');
    if (hasSecret.toLowerCase() === 'y') {
        envVars.NEXTAUTH_SECRET = await question('NEXTAUTH_SECRET: ');
    } else {
        log.info('Generating NEXTAUTH_SECRET...');
        const secret = require('crypto').randomBytes(32).toString('base64');
        envVars.NEXTAUTH_SECRET = secret;
        log.success(`Generated: ${secret}`);
    }

    // Google AI
    log.info('\nGoogle AI Configuration');
    const hasGoogleAI = await question('Sudah punya Google AI API Key? (y/n): ');
    if (hasGoogleAI.toLowerCase() === 'y') {
        envVars.GOOGLE_GENERATIVE_AI_API_KEY = await question('Google AI API Key: ');
    } else {
        log.warning('Dapatkan API key di: https://makersuite.google.com/app/apikey');
        envVars.GOOGLE_GENERATIVE_AI_API_KEY = await question('Google AI API Key: ');
    }

    // Stripe
    log.info('\nStripe Configuration');
    log.warning('PENTING: Gunakan LIVE keys untuk production!');
    envVars.STRIPE_SECRET_KEY = await question('STRIPE_SECRET_KEY (sk_live_...): ');
    envVars.STRIPE_PUBLISHABLE_KEY = await question('STRIPE_PUBLISHABLE_KEY (pk_live_...): ');
    envVars.STRIPE_PRO_PRICE_ID = await question('STRIPE_PRO_PRICE_ID (price_...): ');
    envVars.STRIPE_PRO_ANNUAL_PRICE_ID = await question('STRIPE_PRO_ANNUAL_PRICE_ID (price_...): ');

    const hasWebhook = await question('Sudah setup Stripe webhook? (y/n): ');
    if (hasWebhook.toLowerCase() === 'y') {
        envVars.STRIPE_WEBHOOK_SECRET = await question('STRIPE_WEBHOOK_SECRET (whsec_...): ');
    } else {
        log.warning('Setup webhook di Stripe Dashboard setelah deployment');
        log.info(`Webhook URL: ${appUrl}/api/stripe/webhook`);
        envVars.STRIPE_WEBHOOK_SECRET = 'whsec_PLACEHOLDER';
    }

    // Redis (optional)
    const useRedis = await question('\nGunakan Redis? (y/n): ');
    if (useRedis.toLowerCase() === 'y') {
        envVars.REDIS_URL = await question('REDIS_URL: ');
    }

    // Save to .env.production
    log.title('💾 Saving Configuration');

    const envContent = Object.entries(envVars)
        .map(([key, value]) => `${key}="${value}"`)
        .join('\n');

    const envPath = path.join(process.cwd(), '.env.production');
    fs.writeFileSync(envPath, envContent);
    log.success(`Configuration saved to ${envPath}`);

    // Display summary
    log.title('📋 Configuration Summary');
    console.log(envContent);

    // Ask to deploy
    const deploy = await question('\n🚀 Deploy ke Vercel sekarang? (y/n): ');
    if (deploy.toLowerCase() === 'y') {
        log.info('Deploying to Vercel...');

        // Set environment variables
        log.info('Setting environment variables...');
        for (const [key, value] of Object.entries(envVars)) {
            try {
                execSync(`vercel env add ${key} production`, {
                    input: `${value}\n`,
                    stdio: ['pipe', 'inherit', 'inherit']
                });
                log.success(`Set ${key}`);
            } catch (error) {
                log.warning(`Failed to set ${key}, you can set it manually in Vercel dashboard`);
            }
        }

        // Deploy
        log.info('\nDeploying to production...');
        execSync('vercel --prod', { stdio: 'inherit' });

        log.success('Deployment complete! 🎉');
        log.info('\nNext steps:');
        log.info('1. Run database migrations: npx prisma migrate deploy');
        log.info('2. Setup Stripe webhook if not done yet');
        log.info('3. Test your application');
    } else {
        log.info('\nYou can deploy later with: vercel --prod');
        log.info('Or via Vercel dashboard');
    }

    rl.close();
}

main().catch((error) => {
    log.error(`Error: ${error.message}`);
    process.exit(1);
});
