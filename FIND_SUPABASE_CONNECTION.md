# 🔍 How to Find Supabase Connection String

## Step-by-Step Visual Guide

### Step 1: Go to Project Settings
1. Log into https://supabase.com
2. Select your project from the dashboard
3. Click the **⚙️ Settings icon** (gear icon) in the left sidebar
   - It's at the bottom of the sidebar

### Step 2: Navigate to Database Settings
1. In Settings, click **"Database"** in the left menu
   - It's under the "Project Settings" section

### Step 3: Find Connection String
1. Scroll down to the **"Connection string"** section
2. You'll see a dropdown/tabs with different connection types
3. Look for the **"URI"** tab or option
4. You'll see a connection string that looks like this:

## 🔗 What the Connection String Looks Like

### Format 1: Transaction Pooler (Recommended for Vercel/Serverless)
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Example:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Format 2: Direct Connection (Port 5432)
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## 📝 How to Use It

### Option A: Copy and Replace Password
1. Click the connection string to copy it
2. It will have `[YOUR-PASSWORD]` as a placeholder
3. Replace `[YOUR-PASSWORD]` with the actual password you set when creating the project
4. If you forgot the password, you can reset it in the same settings page

### Option B: Use the "Connection string" with Password
1. Some Supabase dashboards show a connection string with a "Copy" button
2. Click "Copy" - it might already include the password
3. If not, you'll need to replace `[YOUR-PASSWORD]` manually

## 🎯 Quick Visual Guide

```
Supabase Dashboard
├── Projects (select your project)
├── ⚙️ Settings (gear icon at bottom)
│   ├── API
│   ├── Database ← CLICK HERE
│   │   └── Connection string section
│   │       ├── URI tab ← SELECT THIS
│   │       └── Connection string: postgresql://...
│   ├── Auth
│   └── ...
```

## 🔐 What You Need to Replace

The connection string will have placeholders like:
- `[YOUR-PASSWORD]` → Your actual database password
- `[PROJECT-REF]` → Usually already filled in (something like `abcdefghijklmnop`)
- `[REGION]` → Usually already filled in (like `us-west-1`)

## ✅ Final Connection String Should Look Like:

```
postgresql://postgres.abcdefghijklmnop:mypassword123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**OR** (Direct connection):

```
postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## 🆘 Can't Find It?

### Alternative: Get Connection Info Manually

1. Still in **Settings → Database**
2. Look for **"Connection info"** or **"Connection parameters"** section
3. You'll see:
   - **Host:** `db.[PROJECT-REF].supabase.co`
   - **Port:** `5432` (or `6543` for pooler)
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** (your password)

Then construct it manually:
```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

## 📸 Where Exactly?

Here's the exact path:
1. **Supabase Dashboard** → Your Project
2. **Left Sidebar** → Scroll down → **⚙️ Settings** (gear icon)
3. **Settings Menu** → **Database**
4. **Scroll down** → **"Connection string"** section
5. **Select "URI" tab**
6. **Copy the string**

## 💡 Pro Tip

- **For Vercel/Serverless:** Use **Transaction Pooler** (port **6543**)
- **For Local Development:** Either works, but Direct (port **5432**) is simpler
- **Password:** If you forgot it, go to Settings → Database → Database password → Reset

## ✅ Quick Checklist

- [ ] Logged into Supabase
- [ ] Project selected
- [ ] Settings → Database clicked
- [ ] Connection string section found
- [ ] URI format selected
- [ ] Connection string copied
- [ ] Password replaced (if needed)

---

**Still stuck?** Take a screenshot of the Settings → Database page and I can help identify where it is!

