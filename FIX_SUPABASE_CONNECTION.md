# 🔧 Fix Supabase Connection Error in Vercel

## Problem
```
Can't reach database server at `db.yfqcfxxuefrprxzngkhk.supabase.co:5432`
```

This happens because Vercel/serverless functions need to use the **Transaction Pooler** connection instead of the direct connection.

## ✅ Solution: Use Transaction Pooler

### Step 1: Get the Pooler Connection String

1. Go to **Supabase Dashboard** → Your Project
2. Click **⚙️ Settings** (gear icon) → **Database**
3. Scroll to **"Connection string"** section
4. Select **"Transaction Pooler"** tab (not "Direct connection")
5. Select **"URI"** format
6. Copy the connection string - it should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 2: Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. **Edit** it and replace with the pooler connection string
5. Make sure it uses port **6543** (not 5432)
6. Click **Save**

### Step 3: Redeploy

After updating the environment variable:
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a new deployment

## 🔍 What Changed?

**Before (Direct Connection - Not Working):**
```
postgresql://postgres:HSQsExIVRutPiClL@db.yfqcfxxuefrprxzngkhk.supabase.co:5432/postgres
```

**After (Pooler Connection - Works!):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Key Differences:**
- Username: `postgres.[PROJECT-REF]` instead of just `postgres`
- Host: `aws-0-[REGION].pooler.supabase.com` instead of `db.[PROJECT-REF].supabase.co`
- Port: `6543` instead of `5432`

## 🎯 Quick Checklist

- [ ] Got pooler connection string from Supabase
- [ ] Connection string uses port **6543**
- [ ] Updated `DATABASE_URL` in Vercel
- [ ] Redeployed the application
- [ ] Tested authentication (magic link should work now)

## 💡 Why This Works

**Transaction Pooler (Port 6543):**
- ✅ Optimized for serverless functions
- ✅ Handles connection pooling automatically
- ✅ Better for Vercel's serverless architecture
- ✅ Prevents connection exhaustion

**Direct Connection (Port 5432):**
- ❌ Not optimized for serverless
- ❌ Can timeout in serverless environments
- ❌ Better for persistent connections (local dev)

## 🆘 Still Having Issues?

1. **Verify the connection string format:**
   - Should start with `postgresql://`
   - Should have `postgres.[PROJECT-REF]` as username
   - Should use `.pooler.supabase.com` host
   - Should use port `6543`

2. **Check Supabase Dashboard:**
   - Go to Settings → Database
   - Make sure "Transaction Pooler" is enabled
   - Check if there are any IP restrictions

3. **Test the connection:**
   - Try connecting locally with the pooler string
   - If it works locally, it should work on Vercel

---

**After updating, your magic link authentication should work!** 🎉

