# ✅ Test New Supabase Password

## New Password
```
283OqEtK4vnCFsLV
```

This password has no special characters, so **no URL encoding needed**.

## 📋 Connection String Format

**Your connection string should be:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Replace `[REGION]` with your actual region** (e.g., `us-west-1`, `us-east-1`, etc.)

## 🧪 Step 1: Test Locally

```bash
cd humidor-club

# Set the connection string (replace [REGION] with your actual region)
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Test connection
npx prisma db pull --print
```

If it works, you'll see your database schema. If it fails, check:
- Is the region correct?
- Did you copy the connection string correctly from Supabase?

## 🚀 Step 2: Run Migrations

Once the connection works:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate deploy
```

This will create all the tables in your Supabase database:
- `User`, `Account`, `Session`, `VerificationToken` (for NextAuth)
- `Brand`, `Line`, `Cigar`, `Release`, `HumidorItem` (for your app)

## 📝 Step 3: Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. **Edit** it and update with the new password:
   ```
   postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
5. Click **Save**
6. **Redeploy** your application

## ✅ Quick Checklist

- [ ] Got connection string from Supabase (with `[YOUR-PASSWORD]` replaced)
- [ ] Tested connection locally: `npx prisma db pull --print`
- [ ] Connection works
- [ ] Ran migrations: `npx prisma migrate deploy`
- [ ] Updated `DATABASE_URL` in Vercel
- [ ] Redeployed Vercel application

## 💡 Pro Tip

**To get the exact connection string with region:**
1. Go to Supabase Dashboard → Settings → Database
2. Select "Transaction Pooler" tab
3. Select "URI" format
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with `283OqEtK4vnCFsLV`
6. Use that exact string

---

**After updating the password and running migrations, your database should be ready!** 🎉

