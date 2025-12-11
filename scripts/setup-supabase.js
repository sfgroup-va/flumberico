#!/usr/bin/env node

/**
 * Supabase Connection Setup Helper
 * Membantu setup connection string dari Supabase ke format yang benar untuk Prisma
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

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
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
    step: (num, msg) => console.log(`${colors.magenta}[${num}]${colors.reset} ${msg}`)
};

function parseSupabaseUrl(url) {
    // Extract components from Supabase connection string
    const regex = /postgresql:\/\/postgres\.([^:]+):([^@]+)@([^:]+):(\d+)\/(\w+)/;
    const match = url.match(regex);

    if (!match) {
        return null;
    }

    return {
        projectRef: match[1],
        password: match[2],
        host: match[3],
        port: match[4],
        database: match[5]
    };
}

function buildConnectionStrings(projectRef, password, region) {
    const host = `aws-0-${region}.pooler.supabase.com`;

    const DATABASE_URL = `postgresql://postgres.${projectRef}:${password}@${host}:6543/postgres?pgbouncer=true`;
    const DIRECT_URL = `postgresql://postgres.${projectRef}:${password}@${host}:5432/postgres`;

    return { DATABASE_URL, DIRECT_URL };
}

async function main() {
    log.title('🗄️  Supabase Connection Setup Helper');

    console.log('Panduan ini akan membantu Anda setup connection string Supabase untuk Prisma.\n');

    log.step(1, 'Dapatkan Connection String dari Supabase');
    console.log('   Login ke Supabase → Settings → Database → Connection string → URI\n');

    const rawUrl = await question('Paste connection string dari Supabase: ');

    // Try to parse the URL
    const parsed = parseSupabaseUrl(rawUrl);

    if (!parsed) {
        log.error('Format connection string tidak valid');
        log.info('Format yang benar: postgresql://postgres.xxxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres');
        process.exit(1);
    }

    log.success('Connection string berhasil di-parse');
    console.log(`   Project Ref: ${parsed.projectRef}`);
    console.log(`   Host: ${parsed.host}`);
    console.log(`   Port: ${parsed.port}`);

    // Detect region
    let region = 'ap-southeast-1'; // default Singapore
    if (parsed.host.includes('ap-southeast-1')) {
        region = 'ap-southeast-1';
    } else if (parsed.host.includes('us-east-1')) {
        region = 'us-east-1';
    } else if (parsed.host.includes('eu-west-1')) {
        region = 'eu-west-1';
    }

    log.step(2, 'Generate Connection Strings untuk Prisma');

    const { DATABASE_URL, DIRECT_URL } = buildConnectionStrings(
        parsed.projectRef,
        parsed.password,
        region
    );

    console.log('\n' + colors.bright + 'DATABASE_URL (Connection Pooler - untuk queries):' + colors.reset);
    console.log(colors.green + DATABASE_URL + colors.reset);

    console.log('\n' + colors.bright + 'DIRECT_URL (Direct Connection - untuk migrations):' + colors.reset);
    console.log(colors.green + DIRECT_URL + colors.reset);

    log.step(3, 'Simpan ke .env file');

    const saveToEnv = await question('\nSimpan ke .env file? (y/n): ');

    if (saveToEnv.toLowerCase() === 'y') {
        const envPath = path.join(process.cwd(), '.env');

        let envContent = '';

        // Read existing .env if exists
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf-8');

            // Remove old DATABASE_URL and DIRECT_URL
            envContent = envContent
                .split('\n')
                .filter(line => !line.startsWith('DATABASE_URL=') && !line.startsWith('DIRECT_URL='))
                .join('\n');
        }

        // Add new connection strings
        envContent += `\n# Supabase Database Connection\n`;
        envContent += `DATABASE_URL="${DATABASE_URL}"\n`;
        envContent += `DIRECT_URL="${DIRECT_URL}"\n`;

        fs.writeFileSync(envPath, envContent);
        log.success(`Connection strings saved to ${envPath}`);
    }

    log.step(4, 'Test Connection');

    const testConnection = await question('\nTest connection dengan Prisma Studio? (y/n): ');

    if (testConnection.toLowerCase() === 'y') {
        log.info('Opening Prisma Studio...');
        const { execSync } = require('child_process');

        try {
            execSync('npx prisma studio', { stdio: 'inherit' });
        } catch (error) {
            log.error('Failed to open Prisma Studio');
            log.info('You can test manually with: npx prisma studio');
        }
    }

    log.title('✅ Setup Complete!');

    console.log('Next steps:');
    log.info('1. Run migrations: npx prisma migrate deploy');
    log.info('2. (Optional) Seed database: npm run seed');
    log.info('3. Add connection strings to Vercel environment variables');

    console.log('\n' + colors.bright + 'For Vercel deployment:' + colors.reset);
    console.log('1. Go to Vercel Dashboard → Settings → Environment Variables');
    console.log('2. Add DATABASE_URL and DIRECT_URL');
    console.log('3. Deploy!\n');

    rl.close();
}

main().catch((error) => {
    log.error(`Error: ${error.message}`);
    process.exit(1);
});
