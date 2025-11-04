# 🔧 Fix Prisma Connection String Error

## Error
```
P1013: The provided database string is invalid. invalid domain character in database URL
```

This usually happens when the password (or other parts) contains special characters that need to be URL-encoded.

## ✅ Solution: URL-Encode Special Characters

### Step 1: Check Your Password

Your password: `HSQsExIVRutPiClL`

If your actual password contains special characters like:
- `@` → needs to be `%40`
- `#` → needs to be `%23`
- `$` → needs to be `%24`
- `%` → needs to be `%25`
- `&` → needs to be `%26`
- `+` → needs to be `%2B`
- `=` → needs to be `%3D`
- `?` → needs to be `%3F`
- `/` → needs to be `%2F`
- ` ` (space) → needs to be `%20`

### Step 2: URL-Encode the Password

**Option A: Use Online Tool**
1. Go to https://www.urlencoder.org/
2. Paste your password
3. Click "Encode"
4. Copy the encoded version

**Option B: Use Node.js/JavaScript**
```javascript
// In Node.js or browser console
encodeURIComponent('HSQsExIVRutPiClL')
// Returns: 'HSQsExIVRutPiClL' (no change if no special chars)

// If password has special chars:
encodeURIComponent('My@Pass#123')
// Returns: 'My%40Pass%23123'
```

**Option C: Use Command Line**
```bash
# macOS/Linux
echo -n "HSQsExIVRutPiClL" | jq -sRr @uri
# Or use python
python3 -c "import urllib.parse; print(urllib.parse.quote('HSQsExIVRutPiClL'))"
```

### Step 3: Construct the Connection String

**Format:**
```
postgresql://postgres.[PROJECT-REF]:[URL_ENCODED_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Example (if password is `HSQsExIVRutPiClL`):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Example (if password is `My@Pass#123`):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:My%40Pass%23123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Step 4: Verify the Connection String

The connection string should:
- ✅ Start with `postgresql://`
- ✅ Have `postgres.[PROJECT-REF]` as username (with project ref)
- ✅ Have URL-encoded password (no special chars visible)
- ✅ Have `aws-0-[REGION].pooler.supabase.com` as host
- ✅ Have port `6543`
- ✅ End with `/postgres`
- ✅ Have no spaces or unencoded special characters

### Step 5: Test the Connection String

**Option A: Test with Prisma**
```bash
cd humidor-club

# Set the connection string
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:[ENCODED_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Test connection
npx prisma db pull --print
```

**Option B: Test with psql (if installed)**
```bash
psql "postgresql://postgres.yfqcfxxuefrprxzngkhk:[ENCODED_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

## 🔍 Common Issues

### Issue 1: Password Has Special Characters
**Solution:** URL-encode the password

### Issue 2: Missing Region
**Problem:** Connection string might be missing the region
**Solution:** Make sure you have `aws-0-[REGION]` in the host (e.g., `aws-0-us-west-1`)

### Issue 3: Wrong Format
**Problem:** Using direct connection format instead of pooler
**Solution:** Use pooler format with `postgres.[PROJECT-REF]` username

## 💡 Quick Fix Script

If you want to quickly encode your password:

```bash
# Create a helper script
cat > encode-password.sh << 'EOF'
#!/bin/bash
echo "Enter your Supabase password:"
read -s password
echo ""
echo "URL-encoded password:"
python3 -c "import urllib.parse; print(urllib.parse.quote('$password'))"
EOF

chmod +x encode-password.sh
./encode-password.sh
```

## 📋 Complete Example

Let's say:
- Project ref: `yfqcfxxuefrprxzngkhk`
- Password: `HSQsExIVRutPiClL` (no special chars, so no encoding needed)
- Region: `us-west-1` (you need to check this in Supabase)

**Connection string:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**To use:**
```bash
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:HSQsExIVRutPiClL@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
npx prisma migrate deploy
```

## 🎯 Quick Checklist

- [ ] Got pooler connection string from Supabase
- [ ] Identified special characters in password (if any)
- [ ] URL-encoded the password
- [ ] Constructed connection string with encoded password
- [ ] Verified no spaces or invalid characters
- [ ] Tested connection string
- [ ] Updated Vercel environment variable
- [ ] Redeployed application

---

**After fixing the connection string, the error should be resolved!** 🎉

