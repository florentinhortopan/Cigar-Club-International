# 🚀 Run PostgreSQL Migrations on Supabase

## ✅ Current Status

- ✅ **Prisma schema** is configured for PostgreSQL
- ✅ **Migration files** exist (`20251103223653_init_postgresql`)
- ❌ **Migrations haven't been run** on Supabase database yet
- ❌ **Tables don't exist** in Supabase (that's why connection fails)

## 📋 Step-by-Step: Run Migrations

### Step 1: Get the Pooler Connection String

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **Database**
3. Scroll to **"Connection string"** section
4. Select **"Transaction Pooler"** tab
5. Select **"URI"** format
6. Copy the connection string (should use port **6543**)
7. Replace `[YOUR-PASSWORD]` with `HSQsExIVRutPiClL`
8. Final string should look like:
   ```
   postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 2: Run Migrations Locally (with Supabase connection)

```bash
cd humidor-club

# Set the DATABASE_URL to Supabase pooler connection
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Generate Prisma Client
npx prisma generate

# Run migrations (this will create all tables in Supabase)
npx prisma migrate deploy
```

**Note:** This will create all the tables in your Supabase database.

### Step 3: Verify Tables Were Created

1. Go to **Supabase Dashboard** → Your Project
2. Click **Table Editor** in the left sidebar
3. You should see these tables:
   - `User`
   - `Account`
   - `Session`
   - `VerificationToken`
   - `Brand`
   - `Line`
   - `Cigar`
   - `Release`
   - `HumidorItem`

### Step 4: Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. **Edit** it and paste the same pooler connection string (port 6543)
5. Click **Save**
6. **Redeploy** your application

### Step 5: (Optional) Seed the Database

If you want to add sample data:

```bash
# Make sure DATABASE_URL is set to Supabase
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Run seed script
npx prisma db seed
```

## 🎯 Quick Commands Summary

```bash
cd humidor-club

# 1. Set connection string (get from Supabase Dashboard)
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations (creates tables)
npx prisma migrate deploy

# 4. (Optional) Seed database
npx prisma db seed
```

## ⚠️ Important Notes

1. **Use Pooler Connection (Port 6543)** for Vercel/serverless
2. **Direct Connection (Port 5432)** works for local development, but pooler works too
3. **Migrations only need to run once** - after that, your Supabase database will have all tables
4. **Vercel needs the same connection string** - make sure it's the pooler connection

## 🔍 Troubleshooting

### Error: "Can't reach database server"
- Make sure you're using the **pooler connection** (port 6543)
- Check that the password is correct: `HSQsExIVRutPiClL`
- Verify the connection string format

### Error: "Migration already applied"
- The migrations have already been run
- Your tables should exist in Supabase
- Check Supabase Table Editor to verify

### Error: "Table already exists"
- Some tables might already exist
- You can either:
  - Drop existing tables and re-run migrations
  - Or just continue - existing tables won't be affected

## ✅ After Migrations

Once migrations are complete:
1. ✅ All tables exist in Supabase
2. ✅ Vercel `DATABASE_URL` is set (pooler connection)
3. ✅ Vercel app is redeployed
4. ✅ Authentication should work
5. ✅ Magic links should work

---

**After running migrations, your database connection error should be fixed!** 🎉

