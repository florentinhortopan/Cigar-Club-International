# 🔐 NEXTAUTH_URL Configuration for Vercel

## ✅ Correct Value

**Use your production domain:**
```
NEXTAUTH_URL=https://cigar-club-international.vercel.app
```

## ❌ Don't Use

**Deployment URL (preview deployments):**
```
cigar-club-international-nym6hzlrc-florentin-hortopans-projects.vercel.app
```

This is only for preview deployments, not your production app.

## 📋 Why This Matters

`NEXTAUTH_URL` tells NextAuth:
- What base URL to use for callback URLs
- What domain to set cookies for
- What URL to redirect to after authentication

If you use the wrong URL:
- ❌ Magic links won't work correctly
- ❌ Session cookies won't be set properly
- ❌ Redirects will fail

## 🔧 How to Set in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL` (or create it if it doesn't exist)
4. Set the value to:
   ```
   https://cigar-club-international.vercel.app
   ```
5. Make sure **Environment** is set to:
   - ✅ **Production** (checked)
   - ✅ **Preview** (optional, but recommended)
   - ✅ **Development** (optional)
6. Click **Save**
7. **Redeploy** your application

## ✅ Complete Environment Variables Checklist

For your Vercel project, make sure you have:

```
DATABASE_URL=postgresql://postgres.yfqcfxxuefrprxzngkhk:283OqEtK4vnCFsLV@aws-1-us-east-1.pooler.supabase.com:6543/postgres
NEXTAUTH_URL=https://cigar-club-international.vercel.app
NEXTAUTH_SECRET=DfZx4wXcTPVD5W5vbpusX7CwvixePHqN95yt7TDAnV4=
NODE_ENV=production
```

## 💡 Pro Tip

If you have a custom domain (e.g., `humidor.club`), use that instead:
```
NEXTAUTH_URL=https://humidor.club
```

But for now, use your Vercel production domain.

---

**After updating NEXTAUTH_URL, redeploy and your authentication should work properly!** 🎯

