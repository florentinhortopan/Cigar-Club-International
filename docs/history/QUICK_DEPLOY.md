# ⚡ Quick Deploy Guide

## 🎯 Fastest Path to Production (5 minutes)

### Step 1: Set Up Free PostgreSQL Database

**Option A: Supabase (Recommended)**
1. Go to https://supabase.com
2. Sign up (free)
3. Click "New Project"
4. Wait for database to be created
5. Go to **Settings → Database**
6. Copy the **Connection string** (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

**Option B: Neon (Serverless)**
1. Go to https://neon.tech
2. Sign up (free)
3. Create project
4. Copy connection string

### Step 2: Deploy to Vercel

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready to deploy"
   git push
   ```

2. **Deploy**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Click "Add New Project"
   - Select your repository
   - **Root Directory:** Set to `humidor-club`
   - Click "Deploy"

3. **Set Environment Variables**
   In Vercel dashboard → Your Project → Settings → Environment Variables:
   
   Add these:
   ```
   DATABASE_URL=postgresql://postgres:password@host:5432/postgres
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=run: openssl rand -base64 32
   NODE_ENV=production
   ```

4. **Run Database Migrations**
   - Go to Vercel dashboard → Your Project → Deployments
   - Click on latest deployment → "..." → "Download Function Logs"
   - Or use Vercel CLI:
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

### Step 3: Update Prisma for PostgreSQL

The schema is currently set for SQLite. For production:

1. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name switch_to_postgresql
   ```

3. **Deploy migrations:**
   ```bash
   npx prisma migrate deploy
   ```

---

## 🚀 Alternative: Railway (All-in-One)

Railway includes database + hosting:

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy:**
   ```bash
   cd humidor-club
   railway init
   railway add postgresql  # Adds database automatically
   railway up
   ```

3. **Set environment variables:**
   ```bash
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
   ```

4. **Run migrations:**
   ```bash
   railway run npx prisma migrate deploy
   ```

---

## 📋 Environment Variables Checklist

Make sure these are set in production:

- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NEXTAUTH_URL` - Your app URL (https://...)
- ✅ `NEXTAUTH_SECRET` - Random 32+ character string
- ✅ `NODE_ENV=production`

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🔄 Migration from SQLite to PostgreSQL

If you have data in SQLite:

1. **Export SQLite data:**
   ```bash
   sqlite3 prisma/auth.db .dump > backup.sql
   ```

2. **Import to PostgreSQL:**
   - Use a tool like pgAdmin or DBeaver
   - Or use a migration script

3. **Update schema:**
   - Change `provider = "sqlite"` to `provider = "postgresql"`
   - Run migrations: `npx prisma migrate deploy`

---

## 🎯 Recommended: Vercel + Supabase

**Why:**
- ✅ Vercel: Best for Next.js, free tier, auto-deploy
- ✅ Supabase: Free PostgreSQL, easy setup, great docs

**Total time:** ~10 minutes
**Cost:** Free (for small apps)

---

## 🆘 Troubleshooting

**Database connection fails:**
- Check `DATABASE_URL` format
- Ensure database allows external connections
- Check password is correct

**Build fails:**
- Make sure `DATABASE_URL` is set in Vercel
- Check Node.js version (needs 18+)
- Look at build logs in Vercel dashboard

**Auth not working:**
- Verify `NEXTAUTH_URL` matches your domain exactly
- Check `NEXTAUTH_SECRET` is set
- Ensure User table exists (run migrations)

---

## 📚 Full Guide

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

