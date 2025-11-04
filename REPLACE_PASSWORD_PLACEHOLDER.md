# 🔑 How to Replace Password Placeholder in Supabase Connection String

## 📋 The Connection String from Supabase

When you copy the connection string from Supabase, it looks like:
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

The `[YOUR-PASSWORD]` is a **placeholder** - you need to replace it with your actual database password.

## ✅ Step 1: Find Your Database Password

### Option A: You Remember the Password

If you set it when creating the Supabase project, use that password.

### Option B: You Forgot the Password

**Reset it in Supabase:**

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** (gear icon) → **Database**
3. Scroll to **"Database password"** section
4. Click **"Reset database password"** or **"Change password"**
5. Enter a new password (save it!)
6. Click **"Save"** or **"Reset"**

**Important:** After resetting, all existing connections using the old password will stop working. You'll need to update them.

## ✅ Step 2: Replace the Placeholder

### Simple Replacement

**From Supabase (with placeholder):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**After replacing (example with password `HSQsExIVRutPiClL`):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Just replace `[YOUR-PASSWORD]` with your actual password.**

### If Your Password Has Special Characters

If your password contains special characters, you need to **URL-encode** them:

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
# Using Python
python3 -c "import urllib.parse; print(urllib.parse.quote('YOUR_PASSWORD'))"

# Using Node.js
node -e "console.log(encodeURIComponent('YOUR_PASSWORD'))"
```

**Example:**
- Password: `My@Pass#123`
- Encoded: `My%40Pass%23123`
- Connection string: `postgresql://postgres.yfqcfxxuefrprxzngkhk:My%40Pass%23123@aws-0-[REGION].pooler.supabase.com:6543/postgres`

## ✅ Step 3: Verify the Connection String

**Complete format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Your values:**
- Project ref: `yfqcfxxuefrprxzngkhk`
- Password: `HSQsExIVRutPiClL` (or your actual password)
- Region: Get from Supabase (e.g., `us-west-1`)

**Final example:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## 🧪 Step 4: Test the Connection

```bash
cd humidor-club

# Set the connection string (with password replaced)
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Test it
npx prisma db pull --print
```

If it works, you'll see your database schema. If it fails:
- Check if the password is correct
- Check if special characters are encoded
- Verify the region is correct

## 💡 Quick Reference

**What you copy from Supabase:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**What you use (replace [YOUR-PASSWORD]):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:YOUR_ACTUAL_PASSWORD@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**If password has special chars (encode them):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:ENCODED_PASSWORD@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## 🔒 Security Note

- **Never commit** the connection string with your password to git
- **Use environment variables** (`DATABASE_URL`) instead of hardcoding
- **Keep your password secure** - it's the master password for your database

## ✅ Checklist

- [ ] Found/reset database password in Supabase
- [ ] Copied connection string from Supabase
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Encoded special characters (if any)
- [ ] Tested connection string
- [ ] Works with `npx prisma db pull --print`
- [ ] Set as `DATABASE_URL` environment variable

---

**Just replace `[YOUR-PASSWORD]` with your actual password - that's it!** 🎯

