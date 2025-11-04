# 🔧 How to Replace Password in Connection String

## ✅ This is Normal!

Supabase shows the connection string with `[YOUR-PASSWORD]` as a placeholder. **You can't edit it in Supabase** - you need to manually replace it after copying.

## 📋 Step-by-Step: Manual Replacement

### Step 1: Copy from Supabase

1. Go to **Supabase Dashboard** → Settings → Database
2. Select **"Transaction Pooler"** tab
3. Select **"URI"** format
4. **Copy the connection string** - it will look like:
   ```
   postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 2: Replace the Placeholder

**You need to manually replace `[YOUR-PASSWORD]` with your actual password.**

**From Supabase:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**After manual replacement:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**Just find `[YOUR-PASSWORD]` and replace it with `283OqEtK4vnCFsLV`**

## 💻 Quick Method: Use Text Editor

1. **Copy the connection string** from Supabase
2. **Paste it into a text editor** (or terminal)
3. **Find and replace:**
   - Find: `[YOUR-PASSWORD]`
   - Replace: `283OqEtK4vnCFsLV`
4. **Copy the modified string**
5. **Use it in your terminal or Vercel**

## 🧪 Quick Test

```bash
cd humidor-club

# Paste your modified connection string (with password replaced)
export DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# Test it
npx prisma db pull --print
```

## 📝 Complete Example

**What you copy from Supabase:**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**What you use (after manual replacement):**
```
postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**The only change:** `[YOUR-PASSWORD]` → `283OqEtK4vnCFsLV`

## ✅ Final Connection String

```
postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**Use this exact string for:**
- Local development: `export DATABASE_URL="..."`
- Vercel environment variable

## 💡 Pro Tip

**Create a file to store it:**
```bash
# Create .env.local (don't commit this!)
echo 'DATABASE_URL="postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres"' > .env.local
```

Then Prisma will automatically use it (no need to `export`).

---

**Supabase shows a placeholder - just replace it manually!** 🎯

