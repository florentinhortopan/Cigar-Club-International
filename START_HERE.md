# 🚀 START HERE - Quick Launch Guide

## Current Status: Development Server Running ✅

Your Next.js app is running at **http://localhost:3000**, but authentication won't work yet because **SurrealDB is not running**.

## ⚡ Quick Start (2 minutes)

### Step 1: Install SurrealDB (if needed)

```bash
# macOS
brew install surrealdb/tap/surreal

# Or visit: https://surrealdb.com/install
```

### Step 2: Start SurrealDB

**Open a NEW terminal window** and run:

```bash
surreal start --user root --pass root --bind 0.0.0.0:8000
```

Leave this running! You should see the SurrealDB logo.

### Step 3: Test the App

1. Go to http://localhost:3000/sign-in
2. Enter any email address
3. Click "Send Magic Link"
4. Check your **original terminal** (where Next.js is running) for the magic link
5. Copy and paste the link into your browser
6. 🎉 You're signed in!

## 📁 Project Structure

```
Cigar-Club-International/
├── START_HERE.md          ← You are here
├── START_SURREALDB.md     ← Detailed SurrealDB guide
├── APP_RUNNING.md         ← What's built & working
├── DEVELOPMENT_GUIDE.md   ← Full dev setup
├── GET_STARTED.md         ← Architecture overview
│
└── humidor-club/          ← Main app
    ├── app/               ← Next.js pages
    ├── components/        ← React components
    ├── lib/               ← Core utilities
    └── database/          ← SurrealDB schema
```

## 🎯 What's Working

- ✅ Next.js dev server (http://localhost:3000)
- ✅ All pages and UI
- ✅ Mobile-first responsive design
- ⏳ Auth (needs SurrealDB running)

## 🗄️ Database Setup

We use **SurrealDB for everything**:
- ✅ NextAuth (users, sessions, tokens)
- ✅ App data (cigars, humidors, marketplace)
- ✅ All in one database!

No Prisma, no PostgreSQL - just SurrealDB.

## 📖 Documentation Quick Links

- **[START_SURREALDB.md](./START_SURREALDB.md)** - SurrealDB setup & troubleshooting
- **[APP_RUNNING.md](./APP_RUNNING.md)** - Features & testing guide
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Detailed dev workflow

## 🐛 Common Issues

### "Module not found" or build errors
The server auto-reloads. Wait a few seconds.

### Auth not working
SurrealDB must be running on port 8000. See [START_SURREALDB.md](./START_SURREALDB.md)

### Port 3000 in use
```bash
lsof -ti:3000 | xargs kill -9
pnpm dev
```

## 🚀 Next Steps

1. ✅ Get auth working (start SurrealDB)
2. 🔨 Build features (see DEVELOPMENT_GUIDE.md)
3. 🎨 Customize UI
4. 🗄️ Load full schema with seed data

---

**Quick Commands**

```bash
# Terminal 1: SurrealDB
surreal start --user root --pass root

# Terminal 2: Next.js (already running)
cd humidor-club
pnpm dev

# Terminal 3: Development
pnpm lint       # Check code
pnpm type-check # TypeScript validation
```

**You're ready to build!** 🎉
