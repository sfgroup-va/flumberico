# 🚀 Panduan Deploy Flumberico ke Vercel

Panduan lengkap untuk deploy aplikasi Flumberico ke Vercel dengan database production-ready.

---

## 📋 Daftar Isi

1. [Persiapan Database](#1-persiapan-database)
2. [Setup Vercel Project](#2-setup-vercel-project)
3. [Konfigurasi Environment Variables](#3-konfigurasi-environment-variables)
4. [Deploy ke Vercel](#4-deploy-ke-vercel)
5. [Setup Database Schema](#5-setup-database-schema)
6. [Verifikasi Deployment](#6-verifikasi-deployment)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Persiapan Database

Anda memiliki beberapa pilihan untuk database production:

### Opsi A: Supabase (Rekomendasi - Gratis untuk mulai)

**Keuntungan:**
- ✅ Free tier yang generous (500MB database, 2GB bandwidth)
- ✅ PostgreSQL managed dengan backup otomatis
- ✅ Dashboard yang user-friendly
- ✅ Built-in authentication (opsional)
- ✅ Realtime capabilities

**Langkah-langkah:**

1. **Buat Akun Supabase**
   - Kunjungi https://supabase.com
   - Sign up dengan GitHub atau email
   - Verifikasi email Anda

2. **Buat Project Baru**
   - Klik "New Project"
   - Nama project: `flumberico-production`
   - Database Password: **Simpan password ini dengan aman!**
   - Region: Pilih yang terdekat (Singapore untuk Indonesia)
   - Pricing Plan: Free tier
   - Klik "Create new project"
   - Tunggu ~2 menit untuk provisioning

3. **Dapatkan Connection String**
   - Setelah project ready, klik "Settings" (ikon gear)
   - Pilih "Database" di sidebar
   - Scroll ke "Connection string"
   - Pilih tab "URI"
   - Copy connection string (format: `postgresql://postgres:[YOUR-PASSWORD]@...`)
   - **Ganti `[YOUR-PASSWORD]` dengan password yang Anda buat tadi**

4. **Connection String untuk Prisma**
   ```
   DATABASE_URL="postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   ```
   
   **Catatan:**
   - `DATABASE_URL` menggunakan port `6543` (connection pooler) - untuk Prisma queries
   - `DIRECT_URL` menggunakan port `5432` (direct connection) - untuk migrations

### Opsi B: Neon (Alternatif - Serverless PostgreSQL)

**Keuntungan:**
- ✅ Serverless PostgreSQL
- ✅ Free tier 0.5GB storage
- ✅ Auto-scaling
- ✅ Branching database

**Langkah-langkah:**

1. Kunjungi https://neon.tech
2. Sign up dan buat project baru
3. Copy connection string dari dashboard
4. Format sama seperti Supabase

### Opsi C: Railway (Alternatif)

**Keuntungan:**
- ✅ Simple setup
- ✅ $5 free credit per bulan
- ✅ PostgreSQL + Redis dalam satu platform

**Langkah-langkah:**

1. Kunjungi https://railway.app
2. Sign up dan buat project baru
3. Add PostgreSQL service
4. Copy connection string

---

## 2. Setup Vercel Project

### 2.1 Install Vercel CLI (Opsional)

```bash
npm install -g vercel
```

### 2.2 Login ke Vercel

```bash
vercel login
```

### 2.3 Link Project ke Vercel

Ada 2 cara:

#### Cara 1: Via Dashboard (Lebih Mudah)

1. Kunjungi https://vercel.com
2. Sign up/Login dengan GitHub
3. Klik "Add New..." → "Project"
4. Import repository `sfgroup-va/flumberico`
5. Pilih branch `clean-main`
6. **JANGAN klik Deploy dulu!** Kita perlu setup environment variables dulu

#### Cara 2: Via CLI

```bash
cd c:\Users\alpus\Documents\Project_Flumberico\Project\nextjs-job-board
vercel link
```

Ikuti prompt untuk link project.

---

## 3. Konfigurasi Environment Variables

### 3.1 Environment Variables yang Diperlukan

Buat file `.env.production` di local untuk referensi (jangan di-commit!):

```env
# Database (dari Supabase/Neon/Railway)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-random-secret-here"

# Google AI (untuk fitur AI)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Stripe (Payment)
STRIPE_SECRET_KEY="sk_live_..." # Gunakan LIVE key untuk production!
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_PRO_ANNUAL_PRICE_ID="price_..."

# Redis (Opsional - untuk production)
REDIS_URL="redis://..."

# Email (Opsional - untuk notifications)
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@flumberico.com"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

### 3.2 Generate NEXTAUTH_SECRET

```bash
# Di terminal
openssl rand -base64 32
```

Atau gunakan online generator: https://generate-secret.vercel.app/32

### 3.3 Setup Google AI API Key

1. Kunjungi https://makersuite.google.com/app/apikey
2. Create API key
3. Copy dan simpan

### 3.4 Setup Stripe untuk Production

**PENTING:** Untuk production, gunakan **LIVE keys**, bukan test keys!

1. Login ke https://dashboard.stripe.com
2. Toggle dari "Test mode" ke "Live mode" (switch di kanan atas)
3. Klik "Developers" → "API keys"
4. Copy:
   - Publishable key (`pk_live_...`)
   - Secret key (`sk_live_...`) - Klik "Reveal test key"

5. **Setup Products & Prices:**
   - Klik "Products" di sidebar
   - Buat product "Flumberico Pro - Monthly"
   - Set price (misal: $29/month)
   - Copy Price ID (`price_...`)
   - Ulangi untuk Annual plan

6. **Setup Webhook:**
   - Klik "Developers" → "Webhooks"
   - Klik "Add endpoint"
   - Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `checkout.session.completed`
   - Klik "Add endpoint"
   - Copy "Signing secret" (`whsec_...`)

### 3.5 Tambahkan Environment Variables ke Vercel

#### Via Dashboard:

1. Di Vercel dashboard, pilih project Anda
2. Klik "Settings" → "Environment Variables"
3. Tambahkan satu per satu:
   - Key: `DATABASE_URL`
   - Value: `postgresql://...`
   - Environment: Production, Preview, Development (centang semua)
   - Klik "Save"
4. Ulangi untuk semua environment variables di atas

#### Via CLI:

```bash
# Set satu per satu
vercel env add DATABASE_URL production
# Paste value saat diminta

# Atau import dari file
vercel env pull .env.vercel
```

---

## 4. Deploy ke Vercel

### 4.1 Deploy via Dashboard

1. Di Vercel dashboard, pilih project
2. Klik "Deploy" atau "Redeploy"
3. Tunggu build selesai (~2-5 menit)

### 4.2 Deploy via CLI

```bash
# Deploy ke production
vercel --prod

# Atau deploy preview
vercel
```

### 4.3 Deploy via Git Push

Setelah setup, setiap push ke branch `clean-main` akan otomatis deploy:

```bash
git add .
git commit -m "Deploy to production"
git push origin clean-main
```

---

## 5. Setup Database Schema

Setelah deploy pertama kali, Anda perlu menjalankan database migrations:

### 5.1 Via Vercel CLI (Rekomendasi)

```bash
# Install dependencies
npm install

# Set environment variables locally untuk migration
# Copy DATABASE_URL dan DIRECT_URL dari Vercel

# Run migration
npx prisma migrate deploy
```

### 5.2 Via Prisma Studio (untuk seed data)

```bash
# Generate Prisma Client
npx prisma generate

# Seed database dengan sample data
npm run seed
```

### 5.3 Alternatif: Via Supabase SQL Editor

1. Login ke Supabase dashboard
2. Klik "SQL Editor"
3. Buat query baru
4. Copy isi file `prisma/migrations/...` dan paste
5. Run query

---

## 6. Verifikasi Deployment

### 6.1 Cek Deployment Status

1. Di Vercel dashboard, lihat "Deployments"
2. Status harus "Ready"
3. Klik URL untuk membuka aplikasi

### 6.2 Test Fitur Utama

- [ ] Homepage loading dengan baik
- [ ] Login/Register berfungsi
- [ ] Job listings tampil
- [ ] Search berfungsi
- [ ] Database connection OK (cek di logs)
- [ ] Stripe payment test (gunakan test card: 4242 4242 4242 4242)

### 6.3 Monitoring

1. **Vercel Analytics:**
   - Klik "Analytics" di dashboard
   - Monitor traffic dan performance

2. **Vercel Logs:**
   - Klik "Logs" untuk melihat runtime logs
   - Cek error jika ada

3. **Database Monitoring:**
   - Supabase: Dashboard → Database → Logs
   - Monitor query performance

---

## 7. Troubleshooting

### Error: "Database connection failed"

**Solusi:**
1. Cek `DATABASE_URL` dan `DIRECT_URL` di environment variables
2. Pastikan password benar (tidak ada karakter special yang perlu di-encode)
3. Cek IP whitelist di Supabase (seharusnya allow all untuk Vercel)
4. Test connection dengan Prisma Studio:
   ```bash
   npx prisma studio
   ```

### Error: "Prisma Client not generated"

**Solusi:**
1. Tambahkan postinstall script di `package.json`:
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate"
     }
   }
   ```
2. Redeploy

### Error: "NEXTAUTH_URL not configured"

**Solusi:**
1. Set `NEXTAUTH_URL` di Vercel environment variables
2. Value: `https://your-app.vercel.app`

### Error: "Stripe webhook signature verification failed"

**Solusi:**
1. Pastikan `STRIPE_WEBHOOK_SECRET` benar
2. Cek endpoint URL di Stripe dashboard
3. Test webhook dengan Stripe CLI:
   ```bash
   stripe listen --forward-to https://your-app.vercel.app/api/stripe/webhook
   ```

### Build Error: "Module not found"

**Solusi:**
1. Cek `package.json` dependencies
2. Run `npm install` locally
3. Commit `package-lock.json`
4. Redeploy

### Performance Issues

**Solusi:**
1. Enable Vercel Edge Functions untuk API routes
2. Optimize images dengan Next.js Image component
3. Enable caching di Supabase
4. Consider Redis untuk caching (Upstash free tier)

---

## 🎯 Checklist Deployment

Gunakan checklist ini untuk memastikan deployment sukses:

### Pre-Deployment
- [ ] Code di-push ke GitHub branch `clean-main`
- [ ] Database production sudah dibuat (Supabase/Neon/Railway)
- [ ] Stripe products & prices sudah dibuat
- [ ] Google AI API key sudah didapat
- [ ] NEXTAUTH_SECRET sudah di-generate

### Vercel Setup
- [ ] Project sudah di-import ke Vercel
- [ ] Semua environment variables sudah ditambahkan
- [ ] Build settings sudah benar (Next.js framework auto-detected)

### Post-Deployment
- [ ] Database migrations sudah dijalankan
- [ ] Database sudah di-seed (opsional)
- [ ] Stripe webhook sudah dikonfigurasi
- [ ] Domain custom sudah ditambahkan (opsional)
- [ ] SSL certificate active (otomatis dari Vercel)
- [ ] Aplikasi bisa diakses dan berfungsi normal

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking setup (Sentry opsional)
- [ ] Database monitoring active
- [ ] Backup strategy defined

---

## 🚀 Next Steps

Setelah deployment berhasil:

1. **Setup Custom Domain** (Opsional)
   - Beli domain di Namecheap/GoDaddy
   - Add domain di Vercel settings
   - Update DNS records

2. **Setup Email Service** (Opsional)
   - Resend.com (free tier 3000 emails/month)
   - SendGrid
   - AWS SES

3. **Setup Redis** (Untuk production)
   - Upstash (free tier)
   - Redis Cloud
   - Railway

4. **Setup Monitoring**
   - Sentry untuk error tracking
   - LogRocket untuk session replay
   - Google Analytics

5. **SEO Optimization**
   - Submit sitemap ke Google Search Console
   - Setup Google Analytics
   - Add meta tags

---

## 📞 Butuh Bantuan?

Jika mengalami masalah:

1. Cek Vercel logs untuk error details
2. Cek Supabase logs untuk database issues
3. Buka issue di GitHub repository
4. Contact support di support@flumberico.com

---

**Good luck dengan deployment! 🎉**

*Dibuat dengan ❤️ oleh Tim Flumberico*
