# 🧪 Test Authentication Flow

## ✅ Current Status

### Running Services

1. **SurrealDB** ✅ Running on port 8000
   - Process ID: 56612
   - Location: localhost:8000
   - User: root / Pass: root

2. **Next.js Dev Server** ✅ Running on port 3000
   - URL: http://localhost:3000
   - Hot reload enabled

## 🧪 Manual Auth Test (Recommended)

### Step 1: Open the Sign-In Page

Open your browser and go to:
```
http://localhost:3000/sign-in
```

You should see:
- ✅ Cigarette icon
- ✅ "Welcome Back" heading
- ✅ Email input field
- ✅ "Send Magic Link" button

### Step 2: Enter Your Email

Enter **any email address** (it doesn't have to be real in development):
```
test@example.com
```

### Step 3: Click "Send Magic Link"

Watch for:
- 🔄 Button shows "Sending..." with spinner
- 📧 In your **terminal where Next.js is running**, you should see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 MAGIC LINK (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: test@example.com
🔗 Link: http://localhost:3000/api/auth/callback/email?token=...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Copy the Magic Link

Copy the entire URL from the console (starts with `http://localhost:3000/api/auth/callback/email?token=...`)

### Step 5: Paste in Browser

Paste the link into your browser and press Enter.

### Step 6: Success! 🎉

You should be:
- ✅ Redirected to `/dashboard`
- ✅ Seeing your dashboard with stats
- ✅ Bottom navigation working (mobile)
- ✅ Sidebar working (desktop)

## 🔍 What's Happening Behind the Scenes

1. **You enter email** → NextAuth validates it
2. **NextAuth generates token** → Stored in SurrealDB
3. **Magic link logged** → Console (dev mode only)
4. **You click link** → NextAuth verifies token from SurrealDB
5. **Token valid** → JWT session created
6. **Redirected** → Dashboard with authenticated session

## 🐛 Troubleshooting

### "CLIENT_FETCH_ERROR"

**Cause**: SurrealDB not running or not accessible

**Fix**:
```bash
# Check if SurrealDB is running
ps aux | grep surreal

# If not running, start it:
surreal start --user root --pass root memory

# If already running, restart it:
pkill surreal
surreal start --user root --pass root memory
```

### No magic link in console

**Cause**: NextAuth not logging or error in sendVerificationRequest

**Check**:
1. Look for errors in terminal
2. Make sure `NODE_ENV=development` in `.env.local`
3. Restart dev server: `pnpm dev`

### "Module not found" errors

**Cause**: Dependencies not installed

**Fix**:
```bash
cd humidor-club
pnpm install
```

### Can't access database

**Cause**: SurrealDB connection issues

**Fix**:
1. Check `.env.local` has correct SURREALDB_URL
2. Verify SurrealDB running: `lsof -i :8000`
3. Restart both services

## 🎯 Success Indicators

After successful auth, you should be able to:

1. ✅ Navigate to `/dashboard` - See empty stats
2. ✅ Navigate to `/cigars` - See search interface
3. ✅ Navigate to `/humidor` - See empty collection
4. ✅ Navigate to `/marketplace` - See listing tabs
5. ✅ Navigate to `/profile` - See your profile

## 📊 Check Database (Optional)

To see the auth data in SurrealDB:

```bash
# Open SurrealDB CLI
surreal sql --conn http://localhost:8000 \
  --user root --pass root \
  --ns humidor_club --db production

# In the SQL prompt, run:
SELECT * FROM user;
SELECT * FROM verification_token;
SELECT * FROM session;
```

## 🚀 Next Steps After Auth Works

Once authentication is working:

1. **Build first feature** - Cigar search and browse
2. **Add database queries** - Use the SurrealDB client
3. **Create seed data** - Populate with test cigars
4. **Implement humidor** - Personal collection tracking

---

## ⚡ Quick Test Command

Run this to test everything at once:

```bash
# Check all services
echo "🔍 Checking services..."
echo ""
echo "SurrealDB:"
ps aux | grep surreal | grep -v grep || echo "❌ Not running"
echo ""
echo "Next.js:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000
echo ""
echo "Sign-in page:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/sign-in
```

---

**Ready to test! Go to http://localhost:3000/sign-in** 🚀

