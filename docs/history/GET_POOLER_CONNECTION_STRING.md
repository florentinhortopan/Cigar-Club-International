# 🔍 How to Get Supabase Pooler Connection String

## ⚠️ Important: Two Different URLs

**Supabase API URL** (what you showed):
```
https://yfqcfxxuefrprxzngkhk.supabase.co
```
- This is for Supabase JS client (`@supabase/supabase-js`)
- This is NOT the database connection string!

**Database Connection String** (what you need for Vercel):
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres
```
- This is for Prisma/PostgreSQL connection
- This goes in `DATABASE_URL` environment variable

## 📋 Step-by-Step: Get Pooler Connection String

### Step 1: Go to Supabase Dashboard
1. Go to https://supabase.com
2. Log in
3. Select your project: `yfqcfxxuefrprxzngkhk`

### Step 2: Navigate to Database Settings
1. In the left sidebar, scroll down
2. Click **⚙️ Settings** (gear icon at the bottom)
3. Click **Database** in the settings menu

### Step 3: Find Connection String Section
1. Scroll down to the **"Connection string"** section
2. You'll see tabs or a dropdown with options:
   - **Direct connection** (port 5432) ❌ Don't use this for Vercel
   - **Transaction Pooler** (port 6543) ✅ Use this for Vercel

### Step 4: Select Transaction Pooler
1. Click on **"Transaction Pooler"** tab/option
2. You'll see different connection formats:
   - **Session mode**
   - **Transaction mode**
   - **URI** ← Select this one!

### Step 5: Copy the URI Connection String
1. Select **"URI"** format
2. You'll see a connection string that looks like:
   ```
   postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with your actual database password: `HSQsExIVRutPiClL`
4. The final string should be:
   ```
   postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
5. **Copy this entire string**

## ✅ Update Vercel Environment Variable

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project

### Step 2: Edit DATABASE_URL
1. Click **Settings** → **Environment Variables**
2. Find `DATABASE_URL` in the list
3. Click **Edit** (or the pencil icon)
4. **Replace** the entire value with the pooler connection string you copied
5. Make sure it:
   - Uses port **6543** (not 5432)
   - Has `postgres.yfqcfxxuefrprxzngkhk` as username (not just `postgres`)
   - Has `.pooler.supabase.com` in the host (not `.supabase.co`)
6. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for the deployment to complete

## 🔍 Verify the Connection String Format

**Correct format (what you need):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Key parts:**
- ✅ Username: `postgres.yfqcfxxuefrprxzngkhk` (with project ref)
- ✅ Host: `aws-0-[REGION].pooler.supabase.com` (pooler, not direct)
- ✅ Port: `6543` (not 5432)
- ✅ Password: `HSQsExIVRutPiClL` (your actual password)

**Wrong format (what you have now):**
```
postgresql://postgres:HSQsExIVRutPiClL@db.yfqcfxxuefrprxzngkhk.supabase.co:5432/postgres
```

**What's wrong:**
- ❌ Username: `postgres` (missing project ref)
- ❌ Host: `db.yfqcfxxuefrprxzngkhk.supabase.co` (direct, not pooler)
- ❌ Port: `5432` (direct, not pooler)

## 🎯 Quick Checklist

- [ ] Went to Supabase Dashboard
- [ ] Settings → Database
- [ ] Selected "Transaction Pooler" tab
- [ ] Selected "URI" format
- [ ] Copied the connection string (with port 6543)
- [ ] Replaced `[YOUR-PASSWORD]` with `HSQsExIVRutPiClL`
- [ ] Updated `DATABASE_URL` in Vercel
- [ ] Verified it uses port 6543
- [ ] Redeployed the application

## 🆘 Can't Find It?

If you can't find the Transaction Pooler option:
1. Make sure you're in **Settings → Database** (not API settings)
2. Scroll down past the "Connection info" section
3. Look for tabs that say "Direct connection" and "Transaction Pooler"
4. If you still can't find it, take a screenshot and I can help!

## 💡 Important Notes

- The **Supabase API URL** (`https://yfqcfxxuefrprxzngkhk.supabase.co`) is different from the **database connection string**
- The database connection string is what Prisma uses to connect
- You need the **pooler** connection (port 6543) for Vercel, not the direct connection (port 5432)

---

**After updating and redeploying, the database connection error should be fixed!** 🎉

