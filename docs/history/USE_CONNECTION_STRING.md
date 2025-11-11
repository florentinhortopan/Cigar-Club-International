# ✅ Use Your Supabase Connection String

## Connection String from Supabase

```
postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

## Step 1: Replace Password

**With your new password (`283OqEtK4vnCFsLV`):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

## Step 2: Test Locally

```bash
cd humidor-club

# Set the connection string
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# Test connection
npx prisma db pull --print
```

If it works, you'll see your database schema printed.

## Step 3: Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates all tables in Supabase)
npx prisma migrate deploy
```

This will create all the tables:
- `User`, `Account`, `Session`, `VerificationToken` (NextAuth)
- `Brand`, `Line`, `Cigar`, `Release`, `HumidorItem` (App data)

## Step 4: Update Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. **Edit** it and set to:
   ```
   postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Click **Save**
6. **Redeploy** your application

## ✅ Complete Connection String

```
postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**Use this exact string for both:**
- Local development (`export DATABASE_URL=...`)
- Vercel environment variable

---

**After running migrations and updating Vercel, everything should work!** 🎉

