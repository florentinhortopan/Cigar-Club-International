# 🔍 How to Check Magic Link in Vercel Production

When you request a magic link in production, it's **always logged** to Vercel's function logs, even if email isn't configured.

## 📋 Method 1: Vercel Dashboard (Easiest)

1. Go to your **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Click **Deployments** tab
4. Click on your latest deployment
5. Click **Functions** tab (or **Logs** tab)
6. Look for the function: `api/auth/[...nextauth]`
7. Click on it to see recent invocations
8. When you request a magic link, you'll see logs like:
   ```
   🔐 MAGIC LINK (Production Mode)
   📧 Email: your@email.com
   🔗 Link: https://your-app.vercel.app/api/auth/callback/email?token=...
   ```

## 📋 Method 2: Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# View logs in real-time
vercel logs --follow

# View logs for specific function
vercel logs --follow --function api/auth/[...nextauth]
```

## 📋 Method 3: Create Debug Endpoint (Optional)

I can create a secure debug endpoint that shows recent magic links (only for testing). Would you like me to add this?

## 🚀 Quick Steps to Test Login

1. **Request magic link:**
   - Go to `https://your-app.vercel.app/sign-in`
   - Enter your email
   - Click "Sign in"

2. **Check Vercel logs:**
   - Follow Method 1 or 2 above
   - Find the magic link in the logs

3. **Copy and paste the link:**
   - Copy the full URL from the logs
   - Paste it in your browser
   - You should be signed in!

## ✉️ To Enable Email Sending (Optional)

If you want actual emails sent instead of checking logs:

1. **Get Resend API Key:**
   - Go to https://resend.com
   - Sign up for free account
   - Get your API key

2. **Add to Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `RESEND_API_KEY` = `re_xxxxxxxxxx`
   - Redeploy

3. **Verify domain (optional):**
   - Resend requires domain verification for production
   - Or use their test domain for development

## 🔒 Security Note

- Magic links expire after **24 hours**
- Each link can only be used **once**
- Links are tied to the email address requested

---

**Need help?** Check the Vercel logs first - the magic link is always there! 🎯

