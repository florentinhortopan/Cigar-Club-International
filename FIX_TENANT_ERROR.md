# 🔧 Fix "Tenant or user not found" Error

## Error
```
FATAL: Tenant or user not found
```

This means the **username format is incorrect** for the Transaction Pooler connection.

## ✅ Solution: Correct Username Format

### The Problem

For **Transaction Pooler** (port 6543), the username must be:
```
postgres.[PROJECT-REF]
```

**NOT** just `postgres` (that's for direct connection).

### Step 1: Verify Your Project Ref

Your project ref is: `yfqcfxxuefrprxzngkhk`

**To verify:**
1. Go to Supabase Dashboard → Your Project
2. Look at the URL or project settings
3. The project ref is in the URL: `https://yfqcfxxuefrprxzngkhk.supabase.co`

### Step 2: Use Correct Username Format

**Wrong (Direct Connection):**
```
postgresql://postgres:password@...
```

**Correct (Transaction Pooler):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:password@...
```

### Step 3: Get the Complete Connection String from Supabase

**The easiest way is to copy it directly from Supabase:**

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** (gear icon) → **Database**
3. Scroll to **"Connection string"** section
4. Click **"Transaction Pooler"** tab
5. Select **"URI"** format
6. Copy the entire connection string

**It should look like:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

7. Replace `[YOUR-PASSWORD]` with your actual password: `HSQsExIVRutPiClL`
8. If your password has special characters, URL-encode them

### Step 4: Test the Connection

```bash
cd humidor-club

# Set the connection string (use the format from Supabase)
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Test connection
npx prisma db pull --print
```

## 🔍 Common Mistakes

### Mistake 1: Using `postgres` instead of `postgres.PROJECT_REF`
```
❌ postgresql://postgres:password@...
✅ postgresql://postgres.yfqcfxxuefrprxzngkhk:password@...
```

### Mistake 2: Wrong Project Ref
```
❌ postgresql://postgres.wrongref:password@...
✅ postgresql://postgres.yfqcfxxuefrprxzngkhk:password@...
```

### Mistake 3: Using Direct Connection Format with Pooler
```
❌ postgresql://postgres:password@db.yfqcfxxuefrprxzngkhk.supabase.co:5432/postgres
✅ postgresql://postgres.yfqcfxxuefrprxzngkhk:password@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## 💡 Quick Reference

**Transaction Pooler Connection String Format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Your specific values:**
- Project ref: `yfqcfxxuefrprxzngkhk`
- Password: `HSQsExIVRutPiClL` (or encoded if it has special chars)
- Region: Get from Supabase Dashboard (e.g., `us-west-1`)

**Complete example (replace [REGION] with your actual region):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## 🎯 Quick Fix Steps

1. **Go to Supabase Dashboard** → Settings → Database
2. **Select "Transaction Pooler"** tab
3. **Select "URI"** format
4. **Copy the entire connection string** (it already has the correct username format!)
5. **Replace `[YOUR-PASSWORD]`** with `HSQsExIVRutPiClL`
6. **Use that exact string** - don't modify the username part

## ✅ After Fixing

Once you have the correct connection string:

```bash
# Set it
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Test
npx prisma db pull --print

# Run migrations
npx prisma migrate deploy
```

---

**The key is: the username must be `postgres.yfqcfxxuefrprxzngkhk` (with your project ref), not just `postgres`!** 🎯

