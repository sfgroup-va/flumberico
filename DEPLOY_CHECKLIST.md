# ✅ Checklist Deploy Flumberico ke Vercel

**Database:** Supabase PostgreSQL + Prisma ✓

---

## 🎯 Langkah-Langkah Deploy (30 Menit)

### ✅ Step 1: Persiapan Supabase (5 menit)

**Anda sudah punya:**
- ✓ Supabase account
- ✓ PostgreSQL database
- ✓ Prisma schema

**Yang perlu Anda lakukan:**

1. **Dapatkan Connection Strings dari Supabase:**
   ```
   Login ke Supabase → Settings → Database → Connection string
   ```

2. **Copy 2 connection strings ini:**
   
   **DATABASE_URL (Connection Pooler - Port 6543):**
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   
   **DIRECT_URL (Direct Connection - Port 5432):**
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```

3. **Simpan di file `.env` lokal (untuk testing):**
   ```bash
   # Di terminal
   echo 'DATABASE_URL="postgresql://postgres.xxxxx:..."' > .env
   echo 'DIRECT_URL="postgresql://postgres.xxxxx:..."' >> .env
   ```

4. **Test connection:**
   ```bash
   npx prisma studio
   ```
   Jika berhasil, Prisma Studio akan terbuka di browser.

---

### ✅ Step 2: Run Database Migrations (5 menit)

**Jalankan migrations ke Supabase:**

```bash
# Generate Prisma Client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# (Opsional) Seed database dengan sample data
npm run seed
```

**Verifikasi di Supabase:**
```
Supabase Dashboard → Table Editor
```
Anda harus melihat tables: User, Job, Application, Company, dll.

---

### ✅ Step 3: Setup Vercel Project (5 menit)

1. **Login ke Vercel:**
   ```
   https://vercel.com
   ```
   Sign up/Login dengan GitHub

2. **Import Repository:**
   - Klik "Add New..." → "Project"
   - Pilih repository: `sfgroup-va/flumberico`
   - Branch: `clean-main`
   - Framework: Next.js (auto-detected)
   - **JANGAN klik Deploy dulu!**

---

### ✅ Step 4: Setup Environment Variables (10 menit)

**Di Vercel Dashboard → Settings → Environment Variables**

Tambahkan variable berikut satu per satu:

#### 1. Database (dari Supabase)
```env
DATABASE_URL = postgresql://postgres.xxxxx:[PASSWORD]@...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL = postgresql://postgres.xxxxx:[PASSWORD]@...pooler.supabase.com:5432/postgres
```

#### 2. NextAuth
```env
NEXTAUTH_URL = https://your-app-name.vercel.app
NEXTAUTH_SECRET = [generate dengan: openssl rand -base64 32]
NEXT_PUBLIC_APP_URL = https://your-app-name.vercel.app
```

**Generate NEXTAUTH_SECRET:**
```bash
# Di terminal
openssl rand -base64 32
```
Atau online: https://generate-secret.vercel.app/32

#### 3. Google AI (untuk fitur AI)
```env
GOOGLE_GENERATIVE_AI_API_KEY = your-api-key
```

**Dapatkan API key:**
https://makersuite.google.com/app/apikey

#### 4. Stripe (Payment)

**PENTING:** Untuk production, gunakan **LIVE keys** (bukan test keys!)

```env
STRIPE_SECRET_KEY = sk_live_...
STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_PRO_PRICE_ID = price_...
STRIPE_PRO_ANNUAL_PRICE_ID = price_...
STRIPE_WEBHOOK_SECRET = whsec_... (setup setelah deploy)
```

**Cara mendapatkan:**
1. Login https://dashboard.stripe.com
2. Toggle ke "Live mode"
3. Developers → API keys
4. Copy Publishable key & Secret key
5. Products → Buat product "Flumberico Pro"
6. Copy Price IDs

#### 5. Redis (Opsional - untuk production)
```env
REDIS_URL = redis://...
```

**Rekomendasi:** Upstash (free tier)
https://upstash.com

---

### ✅ Step 5: Deploy! (5 menit)

1. **Di Vercel Dashboard:**
   - Klik "Deploy"
   - Tunggu build selesai (~3-5 menit)

2. **Atau via CLI:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel --prod
   ```

3. **Monitor deployment:**
   - Lihat logs di Vercel dashboard
   - Cek jika ada error

---

### ✅ Step 6: Setup Stripe Webhook (5 menit)

**Setelah deployment berhasil:**

1. **Dapatkan deployment URL:**
   ```
   https://your-app-name.vercel.app
   ```

2. **Setup webhook di Stripe:**
   - Login https://dashboard.stripe.com
   - Toggle ke "Live mode"
   - Developers → Webhooks
   - Add endpoint: `https://your-app-name.vercel.app/api/stripe/webhook`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `checkout.session.completed`
   - Save
   - Copy "Signing secret" (`whsec_...`)

3. **Update Vercel environment variable:**
   - Settings → Environment Variables
   - Edit `STRIPE_WEBHOOK_SECRET`
   - Paste signing secret
   - Redeploy (Deployments → ... → Redeploy)

---

### ✅ Step 7: Verifikasi (5 menit)

**Test aplikasi Anda:**

- [ ] Homepage loading ✓
- [ ] Login/Register berfungsi ✓
- [ ] Job listings tampil ✓
- [ ] Search berfungsi ✓
- [ ] Database connection OK ✓
- [ ] Create job (untuk employer) ✓
- [ ] Apply job (untuk job seeker) ✓

**Test Stripe (gunakan test mode dulu):**
- Test card: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits

---

## 🎯 Quick Command Reference

```bash
# Test database connection
npx prisma studio

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed

# Deploy to Vercel
vercel --prod

# View logs
vercel logs

# Check deployment status
vercel ls
```

---

## 🚨 Common Issues & Solutions

### Issue: "Database connection failed"

**Solution:**
```bash
# 1. Cek connection string di Vercel env vars
# 2. Pastikan menggunakan port 6543 untuk DATABASE_URL
# 3. Pastikan password benar (no special chars encoding)
# 4. Test locally:
npx prisma studio
```

### Issue: "Prisma Client not generated"

**Solution:**
Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```
Then redeploy.

### Issue: "NEXTAUTH_URL not set"

**Solution:**
Set in Vercel env vars:
```
NEXTAUTH_URL = https://your-app.vercel.app
```

### Issue: Build timeout

**Solution:**
```bash
# Increase build timeout in vercel.json:
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxDuration": 60
      }
    }
  ]
}
```

---

## 📊 Post-Deployment

### Monitor Performance

**Vercel Analytics:**
```
Dashboard → Analytics
```

**Supabase Monitoring:**
```
Dashboard → Database → Logs
```

### Setup Custom Domain (Opsional)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. Vercel → Settings → Domains
3. Add domain
4. Update DNS records

### Enable HTTPS (Otomatis)

Vercel automatically provides SSL certificate.

---

## 🎉 Deployment Complete!

**Your app is live at:**
```
https://your-app-name.vercel.app
```

**Next steps:**
1. Share dengan tim/users
2. Monitor logs dan analytics
3. Setup monitoring (Sentry, LogRocket)
4. Add to Google Search Console
5. Submit sitemap

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **GitHub Issues:** https://github.com/sfgroup-va/flumberico/issues

---

**Selamat! Aplikasi Anda sudah live! 🚀**
