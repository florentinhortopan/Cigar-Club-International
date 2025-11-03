# 🔐 Vercel Environment Variables

When deploying to Vercel, set these environment variables in your project settings:

## Required Variables

### 1. DATABASE_URL
```
postgresql://postgres:HSQsExIVRutPiClL@db.yfqcfxxuefrprxzngkhk.supabase.co:5432/postgres
```

### 2. NEXTAUTH_URL
```
https://your-app-name.vercel.app
```
*(Replace with your actual Vercel URL after deployment)*

### 3. NEXTAUTH_SECRET
```
DfZx4wXcTPVD5W5vbpusX7CwvixePHqN95yt7TDAnV4=
```

### 4. NODE_ENV
```
production
```

## Optional Variables

### EMAIL_FROM
```
noreply@humidor.club
```

### RESEND_API_KEY
*(Only if you want to send actual emails in production)*

---

## 📝 How to Set in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:HSQsExIVRutPiClL@db.yfqcfxxuefrprxzngkhk.supabase.co:5432/postgres`
   - **Environment:** Select all (Production, Preview, Development)
4. Repeat for all variables
5. **Important:** Redeploy after adding variables

---

## ✅ After Setting Variables

Run database migrations in production:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Option 2: Via Vercel Dashboard
# Go to Deployments → Latest → "..." → "Download Function Logs"
# Or use Vercel's shell/terminal feature
```

---

## 🔒 Security Notes

- **Never commit `.env` files** - They're in `.gitignore`
- **Database password** is sensitive - keep it secure
- **NEXTAUTH_SECRET** should be different for each environment ideally
- **Rotate secrets** periodically in production

---

## 🎯 Quick Checklist

- [ ] DATABASE_URL set in Vercel
- [ ] NEXTAUTH_URL set (your Vercel domain)
- [ ] NEXTAUTH_SECRET set
- [ ] NODE_ENV=production set
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Test authentication works
- [ ] Test creating a cigar works

---

Your app is ready to deploy! 🚀

