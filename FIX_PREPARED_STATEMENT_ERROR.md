# 🔧 Fix "Prepared statement already exists" Error

## Error
```
prepared statement "s0" already exists
```

This is a **connection pooling issue** with Supabase Transaction Pooler and Prisma.

## ✅ Solution: Add Connection Parameters

### Option 1: Use Session Mode (Recommended)

Change your connection string to use **Session mode** instead of **Transaction mode**:

1. Go to **Supabase Dashboard** → Settings → Database
2. Select **"Transaction Pooler"** tab
3. Select **"Session mode"** (not Transaction mode)
4. Select **"URI"** format
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with `283OqEtK4vnCFsLV`

**Session mode connection string should look like:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Option 2: Add `pgbouncer=true` Parameter

If you're already using Session mode, add `?pgbouncer=true` to the end:

**Before:**
```
postgresql://postgres.[your-password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**After:**
```
postgresql://postgres.[your-password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Option 3: Use Direct Connection (Not Recommended for Serverless)

If Session mode doesn't work, you can temporarily use direct connection:

```
postgresql://postgres:283OqEtK4vnCFsLV@db.yfqcfxxuefrprxzngkhk.supabase.co:5432/postgres
```

⚠️ **Note:** Direct connection (port 5432) is not recommended for Vercel/serverless as it can cause connection exhaustion.

## 📋 Step-by-Step: Fix in Vercel

### Step 1: Get Session Mode Connection String

1. Go to **Supabase Dashboard** → Settings → Database
2. Select **"Transaction Pooler"** tab
3. Select **"Session mode"** (if not already selected)
4. Select **"URI"** format
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with `283OqEtK4vnCFsLV`
7. If it doesn't already have `?pgbouncer=true`, add it

### Step 2: Update Vercel

1. Go to **Vercel Dashboard** → Your Project → Settings → Environment Variables
2. Find `DATABASE_URL`
3. **Edit** it with the Session mode connection string (with `pgbouncer=true`)
4. Click **Save**
5. **Redeploy** your application

## ✅ Final Connection String Format

**Session Mode with pgbouncer:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 🔍 Why This Happens

- **Transaction mode** (default) doesn't support prepared statements
- **Session mode** supports prepared statements
- Prisma uses prepared statements, so it needs Session mode
- The `pgbouncer=true` parameter tells Prisma to use connection pooling correctly

## 💡 Quick Reference

**Transaction Mode** (default - doesn't work with Prisma):
- Port: 6543
- Doesn't support prepared statements
- ❌ Not compatible with Prisma

**Session Mode** (what you need):
- Port: 6543
- Supports prepared statements
- ✅ Compatible with Prisma
- Add `?pgbouncer=true` to connection string

---

**After switching to Session mode and adding `pgbouncer=true`, the error should be fixed!** 🎯

