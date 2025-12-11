# 🗄️ Database Setup - Quick Reference

Panduan cepat untuk setup database production untuk Flumberico.

---

## 🎯 Pilihan Database (Rekomendasi: Supabase)

| Provider | Free Tier | Kelebihan | Link |
|----------|-----------|-----------|------|
| **Supabase** ⭐ | 500MB DB, 2GB bandwidth | Dashboard bagus, backup otomatis | https://supabase.com |
| **Neon** | 0.5GB storage | Serverless, branching | https://neon.tech |
| **Railway** | $5 credit/bulan | PostgreSQL + Redis | https://railway.app |
| **PlanetScale** | 5GB storage | MySQL, branching | https://planetscale.com |

---

## ⚡ Quick Start: Supabase (5 Menit)

### 1. Buat Project

```bash
1. Buka https://supabase.com
2. Sign up dengan GitHub
3. Klik "New Project"
4. Isi:
   - Name: flumberico-production
   - Database Password: [buat password kuat, SIMPAN!]
   - Region: Southeast Asia (Singapore)
   - Plan: Free
5. Klik "Create new project"
6. Tunggu ~2 menit
```

### 2. Dapatkan Connection String

```bash
1. Klik "Settings" (ikon gear)
2. Klik "Database" di sidebar
3. Scroll ke "Connection string"
4. Pilih tab "URI"
5. Copy connection string
6. Ganti [YOUR-PASSWORD] dengan password Anda
```

### 3. Format untuk Prisma

Anda akan mendapat 2 connection strings:

**Connection Pooler (untuk queries):**
```env
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Direct Connection (untuk migrations):**
```env
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

**Catatan Penting:**
- Port `6543` = Connection pooler (untuk Prisma Client)
- Port `5432` = Direct connection (untuk migrations)
- Tambahkan `?pgbouncer=true` di DATABASE_URL

---

## 🔧 Setup Database Schema

Setelah dapat connection string, jalankan migrations:

### Opsi 1: Local Migration (Rekomendasi)

```bash
# 1. Set environment variables
# Buat file .env di root project
echo 'DATABASE_URL="postgresql://..."' > .env
echo 'DIRECT_URL="postgresql://..."' >> .env

# 2. Install dependencies
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Run migrations
npx prisma migrate deploy

# 5. (Opsional) Seed database
npm run seed
```

### Opsi 2: Via Supabase SQL Editor

```bash
# 1. Di Supabase dashboard, klik "SQL Editor"
# 2. Klik "New query"
# 3. Copy isi file migration SQL
# 4. Paste dan run
```

Lokasi migration files:
```
prisma/migrations/[timestamp]_init/migration.sql
```

---

## 🔍 Verifikasi Database

### Test Connection

```bash
# Test dengan Prisma Studio
npx prisma studio

# Atau test dengan query
npx prisma db execute --stdin <<< "SELECT 1;"
```

### Cek di Supabase Dashboard

```bash
1. Klik "Table Editor"
2. Anda harus melihat tables:
   - User
   - Job
   - Application
   - Company
   - Subscription
   - dll.
```

---

## 📊 Database Schema Overview

Flumberico menggunakan schema berikut:

```
┌─────────────┐
│    User     │ ← Users & Authentication
├─────────────┤
│ id          │
│ email       │
│ name        │
│ role        │
│ ...         │
└─────────────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│     Job     │ │ Application │
├─────────────┤ ├─────────────┤
│ id          │ │ id          │
│ title       │ │ jobId       │
│ company     │ │ userId      │
│ salary      │ │ status      │
│ ...         │ │ ...         │
└─────────────┘ └─────────────┘
       │
       ▼
┌─────────────┐
│  Company    │
├─────────────┤
│ id          │
│ name        │
│ logo        │
│ ...         │
└─────────────┘
```

---

## 🚨 Troubleshooting

### Error: "Can't reach database server"

**Penyebab:**
- Connection string salah
- Password salah
- Network issue

**Solusi:**
```bash
# 1. Cek connection string
echo $DATABASE_URL

# 2. Test dengan psql (jika installed)
psql "postgresql://..."

# 3. Cek di Supabase:
#    - Settings → Database → Connection string
#    - Pastikan password benar
```

### Error: "SSL connection required"

**Solusi:**
Tambahkan `?sslmode=require` di connection string:
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

### Error: "Too many connections"

**Penyebab:**
Menggunakan direct connection untuk queries (seharusnya pooler)

**Solusi:**
Pastikan menggunakan port `6543` (pooler) untuk `DATABASE_URL`:
```env
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Error: "Migration failed"

**Solusi:**
```bash
# 1. Reset database (HATI-HATI: akan hapus semua data!)
npx prisma migrate reset

# 2. Atau deploy ulang
npx prisma migrate deploy --force
```

---

## 🔐 Security Best Practices

### 1. Jangan Commit Connection String

Pastikan `.env` ada di `.gitignore`:
```gitignore
.env
.env.local
.env.production
.env.development
```

### 2. Gunakan Environment Variables

Di Vercel:
```bash
# Via CLI
vercel env add DATABASE_URL production

# Via Dashboard
Settings → Environment Variables → Add
```

### 3. Rotate Password Secara Berkala

Di Supabase:
```bash
Settings → Database → Database password → Reset password
```

### 4. Enable Row Level Security (RLS)

Di Supabase:
```sql
-- Enable RLS untuk table User
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT USING (auth.uid() = id);
```

---

## 📈 Monitoring & Maintenance

### Monitor Database Usage

**Supabase Dashboard:**
```bash
1. Klik "Database"
2. Lihat metrics:
   - Database size
   - Active connections
   - Query performance
```

### Backup Strategy

**Supabase (Automatic):**
- Daily backups (retained 7 days) - Free tier
- Point-in-time recovery - Paid tier

**Manual Backup:**
```bash
# Export database
pg_dump "postgresql://..." > backup.sql

# Import database
psql "postgresql://..." < backup.sql
```

### Optimize Performance

```bash
# 1. Add indexes untuk queries yang sering digunakan
# Di Supabase SQL Editor:
CREATE INDEX idx_job_status ON "Job"(status);
CREATE INDEX idx_application_user ON "Application"("userId");

# 2. Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "Job" WHERE status = 'ACTIVE';

# 3. Enable connection pooling (sudah default di Supabase)
```

---

## 🎯 Checklist Setup Database

- [ ] Buat account Supabase/Neon/Railway
- [ ] Buat project baru
- [ ] Simpan database password dengan aman
- [ ] Copy connection string (DATABASE_URL & DIRECT_URL)
- [ ] Test connection dengan `npx prisma studio`
- [ ] Run migrations dengan `npx prisma migrate deploy`
- [ ] Verify tables created di dashboard
- [ ] (Opsional) Seed database dengan sample data
- [ ] Add connection strings ke Vercel environment variables
- [ ] Test production deployment

---

## 📞 Butuh Bantuan?

**Supabase Support:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

**Prisma Support:**
- Docs: https://www.prisma.io/docs
- Discord: https://pris.ly/discord
- GitHub: https://github.com/prisma/prisma

**Flumberico:**
- GitHub Issues: https://github.com/sfgroup-va/flumberico/issues
- Email: support@flumberico.com

---

**Database setup selesai! Lanjut ke deployment Vercel! 🚀**
