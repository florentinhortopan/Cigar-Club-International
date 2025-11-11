# 🚀 Deployment Guide

This guide will help you deploy the Humidor Club app to production with a proper database and web hosting.

## Quick Start Options

### Option 1: Vercel (Recommended - Easiest)
**Best for:** Next.js apps, automatic deployments, free tier available

### Option 2: Railway
**Best for:** Full-stack apps with database, easy PostgreSQL setup

### Option 3: Render
**Best for:** Free tier with database, good for small projects

---

## 🗄️ Database Setup

Since you're using SQLite locally, you'll need to switch to PostgreSQL for production.

### Recommended: Supabase (Free PostgreSQL)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up for free account
   - Create a new project

2. **Get Database URL**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - It will look like: `postgresql://postgres:[password]@[host]:5432/postgres`

3. **Update Prisma Schema**
   - Already configured to work with PostgreSQL
   - Just need to update `DATABASE_URL` in production

### Alternative: Railway PostgreSQL

1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Copy connection string from database settings

### Alternative: Neon (Serverless PostgreSQL)

1. Go to https://neon.tech
2. Create free account
3. Create project
4. Copy connection string

---

## 🌐 Deployment Options

### Option 1: Deploy to Vercel (Recommended)

**Why Vercel:**
- Built by Next.js creators
- Automatic deployments from Git
- Free tier with generous limits
- Easy environment variable management
- Automatic HTTPS

**Steps:**

1. **Prepare for Deployment**
   ```bash
   # Make sure you have a .env.example file
   # Vercel will use this as a template
   ```

2. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your repository
   - Select the `humidor-club` folder as root (or set it in settings)

4. **Configure Environment Variables**
   In Vercel dashboard → Project Settings → Environment Variables:
   
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key-min-32-chars
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

**Database Migration:**
```bash
# After deployment, run migrations
vercel env pull .env.local  # Get production env vars
npx prisma migrate deploy    # Apply migrations
```

---

### Option 2: Deploy to Railway

**Why Railway:**
- Includes database hosting
- Simple deployment
- Good free trial

**Steps:**

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Create Project**
   ```bash
   cd humidor-club
   railway init
   ```

3. **Add PostgreSQL Database**
   ```bash
   railway add postgresql
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   railway variables set NEXTAUTH_SECRET=your-secret-key
   railway variables set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Run Migrations**
   ```bash
   railway run npx prisma migrate deploy
   ```

---

### Option 3: Deploy to Render

**Steps:**

1. Go to https://render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `cd humidor-club && pnpm install && pnpm build`
   - **Start Command:** `cd humidor-club && pnpm start`
   - **Root Directory:** `humidor-club`

5. Add PostgreSQL Database:
   - Create new PostgreSQL database
   - Copy connection string

6. Set Environment Variables:
   - `DATABASE_URL` (from PostgreSQL)
   - `NEXTAUTH_URL` (your Render URL)
   - `NEXTAUTH_SECRET`
   - `NODE_ENV=production`

---

## 📋 Environment Variables Checklist

Make sure these are set in your production environment:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-a-strong-secret-min-32-chars

# Email (Optional - for magic links)
RESEND_API_KEY=your-resend-api-key  # If using Resend
EMAIL_FROM=noreply@yourdomain.com

# App
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🔄 Database Migration Steps

After setting up your PostgreSQL database:

1. **Update Prisma Schema** (if needed)
   ```prisma
   datasource db {
     provider = "postgresql"  # Already set
     url      = env("DATABASE_URL")
   }
   ```

2. **Run Migrations**
   ```bash
   # In production
   npx prisma migrate deploy
   
   # Or via Railway/Render CLI
   railway run npx prisma migrate deploy
   ```

3. **Seed Database** (Optional)
   ```bash
   npx prisma db seed
   ```

---

## 🖼️ Image Storage

For production, you'll want cloud storage instead of local files:

### Option 1: Cloudinary (Free tier available)
1. Sign up at https://cloudinary.com
2. Get API credentials
3. Update upload endpoint to use Cloudinary

### Option 2: AWS S3
1. Create S3 bucket
2. Get AWS credentials
3. Update upload endpoint

### Option 3: Upload to Vercel Blob (if using Vercel)
1. Install `@vercel/blob`
2. Update upload endpoint

**Current Setup:** Images are stored in `public/uploads/` which works but isn't ideal for production.

---

## 📝 Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables set correctly
- [ ] NEXTAUTH_URL matches your domain
- [ ] Test authentication (magic link)
- [ ] Test creating a cigar
- [ ] Test image uploads (if using cloud storage)
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic with Vercel/Railway/Render)

---

## 🔧 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database allows connections from your host
- Check firewall/network settings

### Authentication Not Working
- Verify `NEXTAUTH_URL` matches your domain exactly
- Check `NEXTAUTH_SECRET` is set
- Ensure database migrations ran (User table exists)

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

---

## 🎯 Recommended Stack for Production

**For Best Experience:**
- **Hosting:** Vercel (Next.js optimized)
- **Database:** Supabase PostgreSQL (free tier, easy setup)
- **Image Storage:** Cloudinary (free tier) or Vercel Blob
- **Email:** Resend (for magic links)

**Quick Start Command:**
```bash
# 1. Set up Supabase database
# 2. Deploy to Vercel
# 3. Set environment variables
# 4. Run migrations
```

---

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [NextAuth.js Production](https://next-auth.js.org/configuration/options)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the deployment platform's logs
2. Verify environment variables
3. Test database connection separately
4. Check Prisma migration status

Good luck with your deployment! 🚀

