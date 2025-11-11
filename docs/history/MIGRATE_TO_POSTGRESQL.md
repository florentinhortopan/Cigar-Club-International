# 🔄 Migrate to PostgreSQL

## ✅ What's Been Done

1. ✅ **Prisma schema updated** to use PostgreSQL
2. ✅ **Schema formatted** and ready for migrations

## 📋 Next Steps

### Step 1: Set Up Supabase

1. Create account at https://supabase.com
2. Create new project
3. Get connection string (see `SUPABASE_SETUP.md`)

### Step 2: Create Migration

```bash
cd humidor-club

# Set DATABASE_URL to your Supabase connection string
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Create migration
npx prisma migrate dev --name migrate_to_postgresql

# This will:
# - Create all tables in PostgreSQL
# - Generate Prisma Client
# - Create migration files
```

### Step 3: Migrate Existing Data (Optional)

If you have data in SQLite that you want to keep:

```bash
# 1. Export SQLite data
sqlite3 prisma/auth.db .dump > backup.sql

# 2. Convert and import to PostgreSQL
# Use a tool like pgAdmin, DBeaver, or write a script
# Or manually export CSV and import

# 3. Or start fresh (recommended for now)
# Just run the seed script after migration
npx prisma db seed
```

### Step 4: Update Local Development

Create `.env.local` in `humidor-club/`:

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NODE_ENV="development"
```

### Step 5: Test Locally

```bash
# Generate Prisma Client
npx prisma generate

# Start dev server
pnpm dev

# Test creating a cigar
# Test authentication
```

### Step 6: Deploy to Vercel

1. Push changes to GitHub
2. Deploy to Vercel (see `QUICK_DEPLOY.md`)
3. Set environment variables in Vercel:
   - `DATABASE_URL` (same Supabase connection string)
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXTAUTH_SECRET`
4. Run migrations in production:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

## ⚠️ Important Notes

1. **SQLite files are no longer used** - The schema now points to PostgreSQL
2. **Local SQLite data** - If you want to keep it, export first
3. **Connection pooling** - Supabase recommends Transaction Pooler (port 6543) for serverless
4. **Environment variables** - Make sure `.env.local` is in `.gitignore`

## 🔍 Verify Migration

After running migrations, verify in Supabase:

1. Go to Supabase Dashboard → Table Editor
2. You should see:
   - `User`
   - `Account`
   - `Session`
   - `VerificationToken`
   - `Brand`
   - `Line`
   - `Cigar`
   - `Release`
   - `HumidorItem`

## 🎯 Quick Commands

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (to view data)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Deploy migrations (production)
npx prisma migrate deploy
```

## ✅ Checklist

- [ ] Supabase project created
- [ ] Connection string copied
- [ ] `.env.local` created with `DATABASE_URL`
- [ ] Migration created: `npx prisma migrate dev --name migrate_to_postgresql`
- [ ] Prisma Client generated: `npx prisma generate`
- [ ] Tested locally: `pnpm dev`
- [ ] Seed data loaded (optional): `npx prisma db seed`
- [ ] Deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Production migrations run: `npx prisma migrate deploy`

---

Ready to deploy! 🚀

