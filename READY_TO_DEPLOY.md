# ✅ READY TO DEPLOY - Flumberico ke Vercel

## 🎉 Database Setup SELESAI!

✅ Supabase connection berhasil  
✅ Database migrations sudah di-deploy  
✅ Tables sudah dibuat di Supabase  
✅ Prisma Studio berjalan (http://localhost:5555)

---

## 📋 Connection Strings untuk Vercel

**Copy connection strings ini ke Vercel Environment Variables:**

### DATABASE_URL
```
postgresql://postgres.ljfdsjwhuvwgbaaqwffd:%40SFGroup111225@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### DIRECT_URL
```
postgresql://postgres.ljfdsjwhuvwgbaaqwffd:%40SFGroup111225@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

---

## 🚀 Langkah Deploy ke Vercel (15 Menit)

### Step 1: Login ke Vercel (2 menit)

1. Buka https://vercel.com
2. Sign up/Login dengan GitHub
3. Authorize Vercel untuk akses repository

### Step 2: Import Project (3 menit)

1. Klik "Add New..." → "Project"
2. Pilih repository: `sfgroup-va/flumberico`
3. Branch: `clean-main`
4. Framework Preset: Next.js (auto-detected)
5. Root Directory: `./` (default)
6. **JANGAN klik Deploy dulu!**

### Step 3: Setup Environment Variables (10 menit)

Di Vercel → Settings → Environment Variables, tambahkan:

#### 1. Database (WAJIB)
```
Name: DATABASE_URL
Value: postgresql://postgres.ljfdsjwhuvwgbaaqwffd:%40SFGroup111225@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
Environment: Production, Preview, Development (centang semua)
```

```
Name: DIRECT_URL
Value: postgresql://postgres.ljfdsjwhuvwgbaaqwffd:%40SFGroup111225@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
Environment: Production, Preview, Development (centang semua)
```

#### 2. NextAuth (WAJIB)

**Generate NEXTAUTH_SECRET:**
```bash
# Di terminal, jalankan:
openssl rand -base64 32
```
Atau buka: https://generate-secret.vercel.app/32

```
Name: NEXTAUTH_URL
Value: https://your-app-name.vercel.app (ganti setelah deploy pertama)
Environment: Production
```

```
Name: NEXTAUTH_SECRET
Value: [hasil dari openssl rand -base64 32]
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-app-name.vercel.app (ganti setelah deploy pertama)
Environment: Production
```

#### 3. Google AI (WAJIB untuk fitur AI)

Dapatkan API key di: https://makersuite.google.com/app/apikey

```
Name: GOOGLE_GENERATIVE_AI_API_KEY
Value: [your-google-ai-api-key]
Environment: Production, Preview, Development
```

#### 4. Stripe (WAJIB untuk payment)

**PENTING:** Untuk production, gunakan **LIVE keys** (sk_live_...)

Login ke https://dashboard.stripe.com → Toggle ke "Live mode"

```
Name: STRIPE_SECRET_KEY
Value: sk_live_... (dari Stripe Dashboard)
Environment: Production
```

```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_... (dari Stripe Dashboard)
Environment: Production
```

**Setup Stripe Products:**
1. Stripe Dashboard → Products
2. Create product "Flumberico Pro - Monthly"
3. Set price (contoh: $29/month)
4. Copy Price ID

```
Name: STRIPE_PRO_PRICE_ID
Value: price_... (dari Stripe product)
Environment: Production
```

```
Name: STRIPE_PRO_ANNUAL_PRICE_ID
Value: price_... (dari Stripe product annual)
Environment: Production
```

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_... (setup SETELAH deploy - lihat Step 5)
Environment: Production
```

#### 5. Supabase Public (OPSIONAL)

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ljfdsjwhuvwgbaaqwffd.supabase.co
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [dari Supabase Dashboard → Settings → API]
Environment: Production, Preview, Development
```

### Step 4: Deploy! (5 menit)

1. Klik "Deploy" di Vercel
2. Tunggu build selesai (~3-5 menit)
3. Jika berhasil, Anda akan dapat URL: `https://your-app-name.vercel.app`

### Step 5: Update Environment Variables (2 menit)

Setelah deploy pertama, update:

1. `NEXTAUTH_URL` → ganti dengan URL deployment Anda
2. `NEXT_PUBLIC_APP_URL` → ganti dengan URL deployment Anda
3. Klik "Redeploy" (Deployments → ... → Redeploy)

### Step 6: Setup Stripe Webhook (5 menit)

1. Login https://dashboard.stripe.com
2. Toggle ke "Live mode"
3. Developers → Webhooks
4. Add endpoint: `https://your-app-name.vercel.app/api/stripe/webhook`
5. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
6. Save dan copy "Signing secret" (`whsec_...`)
7. Update `STRIPE_WEBHOOK_SECRET` di Vercel
8. Redeploy

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Database Supabase sudah dibuat
- [x] Connection strings sudah didapat
- [x] Migrations sudah di-deploy
- [x] Tables sudah ada di Supabase
- [ ] Google AI API key sudah didapat
- [ ] Stripe products sudah dibuat
- [ ] NEXTAUTH_SECRET sudah di-generate

### Vercel Setup
- [ ] Repository sudah di-import
- [ ] Branch `clean-main` dipilih
- [ ] Environment variables sudah ditambahkan:
  - [ ] DATABASE_URL
  - [ ] DIRECT_URL
  - [ ] NEXTAUTH_URL
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXT_PUBLIC_APP_URL
  - [ ] GOOGLE_GENERATIVE_AI_API_KEY
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_PUBLISHABLE_KEY
  - [ ] STRIPE_PRO_PRICE_ID
  - [ ] STRIPE_PRO_ANNUAL_PRICE_ID

### Post-Deployment
- [ ] Deployment berhasil (status: Ready)
- [ ] URL deployment sudah didapat
- [ ] NEXTAUTH_URL sudah di-update
- [ ] NEXT_PUBLIC_APP_URL sudah di-update
- [ ] Stripe webhook sudah dikonfigurasi
- [ ] STRIPE_WEBHOOK_SECRET sudah di-update
- [ ] Aplikasi bisa diakses dan berfungsi

---

## 🎯 Quick Commands

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Test database connection locally
npx prisma studio

# Check migrations status
npx prisma migrate status

# Deploy to Vercel via CLI (optional)
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔗 Important Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Google AI API:** https://makersuite.google.com/app/apikey
- **Generate Secret:** https://generate-secret.vercel.app/32

---

## 🚨 Common Issues

### Build Failed: "Prisma Client not generated"

**Solution:**
Vercel automatically runs `prisma generate` via postinstall script. Pastikan `package.json` punya:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Runtime Error: "Database connection failed"

**Solution:**
1. Cek DATABASE_URL di Vercel env vars
2. Pastikan password benar (@ → %40)
3. Cek di Vercel logs untuk error detail

### Stripe Webhook Failed

**Solution:**
1. Pastikan webhook URL benar
2. Pastikan STRIPE_WEBHOOK_SECRET benar
3. Test dengan Stripe CLI:
```bash
stripe listen --forward-to https://your-app.vercel.app/api/stripe/webhook
```

---

## 🎉 Setelah Deploy Berhasil

### Test Aplikasi
1. Buka URL deployment
2. Test homepage loading
3. Test login/register
4. Test job listings
5. Test search
6. Test create job (employer)
7. Test apply job (job seeker)

### Monitor
1. Vercel Analytics → lihat traffic
2. Vercel Logs → cek errors
3. Supabase Dashboard → monitor database

### Next Steps
1. Setup custom domain (optional)
2. Setup monitoring (Sentry, LogRocket)
3. Submit sitemap ke Google Search Console
4. Share dengan users!

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **GitHub Issues:** https://github.com/sfgroup-va/flumberico/issues

---

**Database sudah ready! Tinggal deploy ke Vercel! 🚀**

**Estimated time to deploy: 15-20 menit**
