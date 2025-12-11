# 🔧 Setup Connection String Supabase

## ❌ Masalah: "Tenant or user not found"

Error ini terjadi karena format connection string tidak tepat atau password tidak ter-encode dengan benar.

## ✅ Solusi: Dapatkan Connection String yang Benar

### Langkah 1: Login ke Supabase Dashboard

1. Buka https://supabase.com/dashboard
2. Pilih project "Flumberico Project"

### Langkah 2: Dapatkan Connection String

1. Klik **Settings** (ikon gear di sidebar kiri)
2. Klik **Database** di menu settings
3. Scroll ke bagian **Connection string**
4. Pilih tab **URI**
5. Mode: **Session pooler** (untuk DATABASE_URL)
6. Copy connection string yang muncul

**Format yang akan Anda dapat:**
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Langkah 3: Buat 2 Connection Strings

Anda perlu 2 connection strings:

#### A. DATABASE_URL (Connection Pooler - Port 6543)
```
postgresql://postgres.bhlabasqsetbkvadeqbj:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### B. DIRECT_URL (Direct Connection - Port 5432)
```
postgresql://postgres.bhlabasqsetbkvadeqbj:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Ganti `[PASSWORD]` dengan password Anda yang SUDAH URL-ENCODED!**

### Langkah 4: URL Encode Password

Password Anda: `8G%+Znb+?*Wx5+q`

**Special characters yang perlu di-encode:**
- `%` → `%25`
- `+` → `%2B`
- `?` → `%3F`
- `*` → `%2A`

**Password ter-encode:** `8G%25%2BZnb%2B%3F%2AWx5%2Bq`

**Atau gunakan online tool:**
https://www.urlencoder.org/

### Langkah 5: Connection Strings Final

**DATABASE_URL:**
```
postgresql://postgres.bhlabasqsetbkvadeqbj:8G%25%2BZnb%2B%3F%2AWx5%2Bq@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DIRECT_URL:**
```
postgresql://postgres.bhlabasqsetbkvadeqbj:8G%25%2BZnb%2B%3F%2AWx5%2Bq@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Langkah 6: Update .env File

Buka file `.env` dan update:

```env
DATABASE_URL="postgresql://postgres.bhlabasqsetbkvadeqbj:8G%25%2BZnb%2B%3F%2AWx5%2Bq@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.bhlabasqsetbkvadeqbj:8G%25%2BZnb%2B%3F%2AWx5%2Bq@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### Langkah 7: Test Connection

```bash
# Test dengan Prisma
npx prisma migrate deploy

# Atau test dengan psql (jika installed)
psql "postgresql://postgres.bhlabasqsetbkvadeqbj:8G%25%2BZnb%2B%3F%2AWx5%2Bq@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

## 🔍 Alternative: Copy dari Supabase Dashboard

**Cara paling mudah:**

1. Di Supabase Dashboard → Settings → Database
2. Connection string → URI
3. **COPY LANGSUNG** connection string yang sudah di-generate Supabase
4. Supabase sudah auto-encode password untuk Anda!
5. Untuk DATABASE_URL: ganti port `5432` → `6543` dan tambahkan `?pgbouncer=true`
6. Untuk DIRECT_URL: gunakan apa adanya (port 5432)

## 📝 Contoh dari Supabase Dashboard

Jika Supabase memberikan:
```
postgresql://postgres.bhlabasqsetbkvadeqbj:xxxxx@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

Maka:
- **DIRECT_URL** = copy apa adanya
- **DATABASE_URL** = ganti `5432` → `6543` + tambahkan `?pgbouncer=true`

## 🚨 Troubleshooting

### Masih Error "Tenant or user not found"?

**Kemungkinan penyebab:**
1. Password salah
2. Project ref salah
3. Region salah
4. Password tidak ter-encode dengan benar

**Solusi:**
1. Reset password di Supabase Dashboard
2. Copy connection string LANGSUNG dari dashboard (jangan ketik manual)
3. Pastikan region benar (ap-southeast-1 untuk Singapore)

### Error "Connection timeout"?

**Solusi:**
1. Cek internet connection
2. Cek firewall/antivirus
3. Tambahkan `?connect_timeout=30` di connection string

### Error "SSL required"?

**Solusi:**
Tambahkan `?sslmode=require` di connection string:
```
...postgres?sslmode=require
```

## ✅ Setelah Connection Berhasil

Jalankan migrations:
```bash
npx prisma migrate deploy
```

Seed database (opsional):
```bash
npm run seed
```

Test dengan Prisma Studio:
```bash
npx prisma studio
```

---

**Jika masih error, screenshot error message dan connection string yang Anda gunakan (HIDE password!).**
