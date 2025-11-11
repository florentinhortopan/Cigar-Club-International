# 🐛 Debug Connection String Error Locally

## Quick Fix: Use the Validator Script

I've created a helper script to construct the connection string correctly:

```bash
cd humidor-club
node validate-connection.js
```

The script will:
1. Ask for your project ref
2. Ask for your password
3. Ask for your region
4. Construct the connection string with proper encoding
5. Validate it
6. Show you the exact string to use

## 📋 Manual Steps

### Step 1: Get Your Region

The region is in the Supabase connection string. Common regions:
- `us-west-1`
- `us-east-1`
- `eu-west-1`
- `ap-southeast-1`

**To find it:**
1. Go to Supabase Dashboard → Settings → Database
2. Look at the Transaction Pooler connection string
3. It will show: `aws-0-[REGION].pooler.supabase.com`
4. The `[REGION]` part is what you need

### Step 2: Construct the Connection String

**Format:**
```
postgresql://postgres.[PROJECT-REF]:[ENCODED_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Example:**
```bash
# If your password has no special characters:
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# If your password has special characters, encode them:
# Password: "My@Pass#123"
# Encoded: "My%40Pass%23123"
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:My%40Pass%23123@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

### Step 3: Test the Connection String

```bash
# Set the connection string
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Test it
npx prisma db pull --print
```

If it works, you'll see your database schema. If it fails, check:

1. **Is the region correct?** (must match what's in Supabase)
2. **Are there special characters in the password?** (encode them)
3. **Is the format exactly as shown?** (no spaces, correct syntax)

## 🔍 Common Mistakes

### Mistake 1: Missing Region
```
❌ postgresql://...@pooler.supabase.com:6543/postgres
✅ postgresql://...@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Mistake 2: Wrong Username
```
❌ postgresql://postgres:password@...
✅ postgresql://postgres.yfqcfxxuefrprxzngkhk:password@...
```

### Mistake 3: Special Characters Not Encoded
```
❌ postgresql://...:My@Pass#123@...
✅ postgresql://...:My%40Pass%23123@...
```

### Mistake 4: Spaces or Newlines
```
❌ postgresql://... (with spaces)
✅ postgresql://... (no spaces)
```

## 💡 Quick Encode Password

If your password has special characters:

```bash
# Using Python
python3 -c "import urllib.parse; print(urllib.parse.quote('YOUR_PASSWORD'))"

# Using Node.js
node -e "console.log(encodeURIComponent('YOUR_PASSWORD'))"
```

## ✅ Checklist

- [ ] Got project ref from Supabase
- [ ] Got region from Supabase connection string
- [ ] Password encoded (if it has special chars)
- [ ] Connection string format is correct
- [ ] No spaces or newlines in the string
- [ ] Tested with `npx prisma db pull --print`
- [ ] Works locally before setting in Vercel

## 🆘 Still Having Issues?

1. **Copy the connection string directly from Supabase Dashboard**
   - Don't construct it manually
   - Just replace `[YOUR-PASSWORD]` with your actual password
   - If password has special chars, encode them

2. **Check for hidden characters**
   ```bash
   # Check the string
   echo "$DATABASE_URL" | cat -A
   # Look for any unexpected characters
   ```

3. **Use the validator script**
   ```bash
   node validate-connection.js
   ```

---

**The validator script will help you get the exact connection string format!** 🎯

