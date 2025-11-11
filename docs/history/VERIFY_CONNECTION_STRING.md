# ✅ Verify Supabase Connection String Format

## 🔍 Common Issues

### Issue 1: Missing Region in Hostname

The pooler connection string **must include the region** in the hostname.

**Wrong:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@pooler.supabase.com:6543/postgres
```

**Correct:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```
(Replace `us-west-1` with your actual region)

### Issue 2: How to Find Your Region

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **Database**
3. Look at the **Connection string** section
4. The region is in the hostname: `aws-0-[REGION].pooler.supabase.com`
5. Common regions: `us-east-1`, `us-west-1`, `eu-west-1`, `ap-southeast-1`

### Issue 3: Wrong Username Format

**Wrong (Direct Connection):**
```
postgresql://postgres:HSQsExIVRutPiClL@...
```

**Correct (Pooler Connection):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@...
```
(Note: `postgres.[PROJECT-REF]`, not just `postgres`)

## 📋 Step-by-Step: Get Correct Connection String

### Step 1: Go to Supabase Dashboard
1. Go to https://supabase.com
2. Select your project

### Step 2: Navigate to Database Settings
1. Click **Settings** (gear icon) → **Database**
2. Scroll to **"Connection string"** section

### Step 3: Select Transaction Pooler
1. Click **"Transaction Pooler"** tab (not "Direct connection")
2. You'll see different connection modes/ports
3. Select **"URI"** format

### Step 4: Copy the Exact String
1. The connection string should look like:
   ```
   postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
2. **Copy this exact format** - it already has the correct structure
3. Replace `[YOUR-PASSWORD]` with your actual password: `HSQsExIVRutPiClL`

### Step 5: If Password Has Special Characters

If your actual password (not the one you shared) has special characters, encode them:

**Special characters that need encoding:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- Space → `%20`

**Quick encode (if needed):**
```bash
python3 -c "import urllib.parse; print(urllib.parse.quote('YOUR_PASSWORD'))"
```

## ✅ Correct Format Checklist

Your connection string should:
- ✅ Start with `postgresql://`
- ✅ Username: `postgres.yfqcfxxuefrprxzngkhk` (with project ref)
- ✅ Password: `HSQsExIVRutPiClL` (or URL-encoded if it has special chars)
- ✅ Host: `aws-0-[REGION].pooler.supabase.com` (with region!)
- ✅ Port: `6543`
- ✅ Database: `/postgres`
- ✅ No spaces anywhere
- ✅ No unencoded special characters

## 🧪 Test the Connection String

```bash
cd humidor-club

# Set the connection string (replace [REGION] with your actual region)
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Test connection
npx prisma db pull --print
```

If it works, you'll see your database schema. If it fails, check:
1. Is the region correct?
2. Is the password correct?
3. Are there any special characters in the password that need encoding?
4. Is the format exactly as shown above?

## 💡 Quick Debug

If you're still getting the error, try:

1. **Copy the connection string directly from Supabase** (don't construct it manually)
2. **Replace only the `[YOUR-PASSWORD]` part** with your actual password
3. **Don't modify anything else** - the format is already correct

---

**The connection string from Supabase Dashboard is already in the correct format - just replace the password placeholder!** 🎯

