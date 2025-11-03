# 🗄️ Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** `humidor-club` (or your choice)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for database to be created

## Step 2: Get Connection String

1. Go to **Project Settings** (gear icon)
2. Click **Database** in sidebar
3. Scroll to **Connection string**
4. Select **URI** tab
5. Copy the connection string
   - It looks like: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
6. Replace `[YOUR-PASSWORD]` with the password you set
7. **Important:** For Prisma, use the **Transaction Pooler** connection (port 6543) or **Direct connection** (port 5432)

## Step 3: Update Your Environment Variables

### For Local Development

Create `.env.local` in `humidor-club/`:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NODE_ENV="development"
```

### For Vercel Production

1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-generated-secret
   NODE_ENV=production
   ```

## Step 4: Run Migrations

After setting up the database:

```bash
cd humidor-club

# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init_postgresql

# Or if migrating existing data:
npx prisma migrate deploy
```

## Step 5: Seed Database (Optional)

```bash
npx prisma db seed
```

## 🔐 Security Notes

1. **Never commit `.env` files** - they're in `.gitignore`
2. **Use different passwords** for dev and production
3. **Rotate `NEXTAUTH_SECRET`** regularly
4. **Enable Row Level Security** in Supabase for production (optional but recommended)

## 📊 Supabase Dashboard Features

- **Table Editor:** View/edit data directly
- **SQL Editor:** Run custom queries
- **API:** REST and GraphQL APIs automatically generated
- **Auth:** Built-in authentication (we're using NextAuth, but Supabase Auth is available too)

## 🆘 Troubleshooting

### Connection Failed
- Check password is correct
- Verify connection string format
- Try Transaction Pooler (port 6543) vs Direct (port 5432)

### Migration Errors
- Make sure database is empty or use `--create-only` flag
- Check Prisma schema matches PostgreSQL syntax
- Verify `DATABASE_URL` is set correctly

### Timeout Issues
- Use Transaction Pooler connection (port 6543) for serverless
- Direct connection (port 5432) for persistent connections

---

## ✅ Next Steps

After Supabase is set up:
1. ✅ Connection string copied
2. ✅ Environment variables set
3. ✅ Migrations run
4. ✅ Test connection locally
5. ✅ Deploy to Vercel with same `DATABASE_URL`

See `QUICK_DEPLOY.md` for Vercel deployment steps.

