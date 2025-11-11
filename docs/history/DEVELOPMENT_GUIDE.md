# 🚀 Development Guide

## Quick Start

### 1. Prerequisites

- **Node.js 18+** (preferably via `nvm`)
- **pnpm** (recommended) or npm
- **SurrealDB** (optional for database features)

### 2. Installation

```bash
cd humidor-club
pnpm install
```

### 3. Environment Setup

The `.env.local` file is already configured for development. Key settings:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=humidor-club-dev-secret-change-in-production
NODE_ENV=development

# SurrealDB (optional for now)
SURREALDB_URL=ws://127.0.0.1:8000/rpc
SURREALDB_NAMESPACE=humidor_club
SURREALDB_DATABASE=production
SURREALDB_USER=root
SURREALDB_PASS=root

# Email (Development - logs to console)
RESEND_API_KEY=re_demo_key
EMAIL_FROM="Humidor Club <noreply@humidor.club>"
```

### 4. Start Development Server

```bash
cd humidor-club
pnpm dev
```

The app will be available at **http://localhost:3000** 🎉

## 📱 What's Working Now

### ✅ Pages & UI

1. **Landing Page** (`/`)
   - Hero section with CTA
   - Features showcase
   - Mobile-optimized

2. **Sign In** (`/sign-in`)
   - Email magic link form
   - In development: magic links are logged to console
   - Error handling

3. **Dashboard** (`/dashboard`)
   - Stats cards
   - Quick actions
   - Empty states

4. **Cigars** (`/cigars`)
   - Search interface
   - Ready for database integration

5. **Humidor** (`/humidor`)
   - Collection tracker
   - Stats display

6. **Marketplace** (`/marketplace`)
   - Listing interface
   - Filter tabs

7. **Profile** (`/profile`)
   - User info
   - Stats & achievements

### ✅ Features

- **Mobile-First Design**: Bottom navigation on mobile, sidebar on desktop
- **NextAuth Integration**: Email magic link authentication
- **Type-Safe**: Full TypeScript setup
- **Modern UI**: Tailwind CSS with custom design system
- **Responsive**: Works beautifully on all screen sizes

## 🎨 UI Design System

### Colors

- **Primary**: Orange (`#f97316`) - Cigar theme
- **Background**: White/Dark slate
- **Muted**: Gray tones for secondary text

### Touch Targets

All interactive elements have minimum 48px height for mobile accessibility.

### Components

- Cards with rounded borders
- Icons from `lucide-react`
- Consistent spacing and typography

## 🔐 Authentication Flow

### Development Mode

1. Go to `/sign-in`
2. Enter any email
3. Click "Send Magic Link"
4. Check your **terminal console** for the magic link
5. Copy and paste the URL into your browser
6. You'll be signed in and redirected to `/dashboard`

### Production Mode

In production (when `NODE_ENV=production`):
- Emails are sent via Resend
- Magic links are valid for 24 hours
- Proper email templates are used

## 🗄️ Database (Coming Soon)

### SurrealDB Setup

To use database features:

```bash
# Install SurrealDB
brew install surrealdb/tap/surreal  # macOS
# or visit https://surrealdb.com/install

# Start SurrealDB
surreal start --user root --pass root

# Load schema (in another terminal)
surreal import --conn http://localhost:8000 \
  --user root --pass root \
  --ns humidor_club --db production \
  database/schema.surql
```

## 📂 Project Structure

```
humidor-club/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (sign-in, etc.)
│   ├── (protected)/       # Protected pages (dashboard, etc.)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
│
├── components/            # React components
│   └── providers/         # Context providers
│
├── lib/                   # Core utilities
│   ├── auth.ts           # Auth helpers
│   ├── surrealdb.ts      # Database client
│   ├── env.ts            # Environment validation
│   ├── errors.ts         # Error handling
│   ├── utils.ts          # Utilities
│   └── validation.ts     # Zod schemas
│
├── database/             # Database schemas
│   └── schema.surql      # SurrealDB schema
│
├── types/                # TypeScript types
│   └── next-auth.d.ts    # NextAuth types
│
└── styles/               # CSS
    └── globals.css       # Global styles
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm type-check       # TypeScript check

# Testing (setup ready)
pnpm test             # Run all tests
pnpm test:unit        # Unit tests
pnpm test:integration # Integration tests
pnpm test:e2e         # E2E tests with Playwright
pnpm test:watch       # Watch mode

# Database
# (when SurrealDB is integrated)
```

## 🎯 Next Steps

### Immediate Tasks

1. **Test the app**
   - Visit http://localhost:3000
   - Try signing in
   - Navigate between pages
   - Test on mobile (responsive view)

2. **Install SurrealDB** (optional)
   - Follow the database setup above
   - Load the schema
   - Test database connectivity

3. **Start building features**
   - Choose a feature from the PRD
   - Follow the component patterns
   - Use the mobile-first approach

### Feature Development Priority

Based on the PRD, here's the recommended order:

1. **Phase 1: Foundation** (Current)
   - ✅ Auth & routing
   - ✅ Layout & navigation
   - ✅ Landing pages

2. **Phase 2: Core Features**
   - Cigar search & browsing
   - Humidor management
   - Tasting notes

3. **Phase 3: Marketplace**
   - Listing creation
   - Offers & negotiations
   - Deal feedback

4. **Phase 4: Community**
   - User profiles
   - Reputation system
   - Admin tools

## 🐛 Troubleshooting

### Port 3000 already in use

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
```

### Auth not working

- Check console for magic link (dev mode)
- Verify `NEXTAUTH_SECRET` is set
- Make sure `NEXTAUTH_URL` matches your URL

## 📚 Documentation

- **[GET_STARTED.md](../GET_STARTED.md)** - Overview
- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** - Quick lookup
- **[docs/PRD_ENHANCED.md](../docs/PRD_ENHANCED.md)** - Full requirements
- **[docs/COMPONENT_GUIDELINES.md](../docs/COMPONENT_GUIDELINES.md)** - Component patterns
- **[docs/API_SPECIFICATION.md](../docs/API_SPECIFICATION.md)** - API reference

## 💡 Tips

1. **Use the bottom navigation on mobile** - It's thumb-friendly!
2. **Check the console** - Magic links are logged in development
3. **Hot reload is enabled** - Changes appear instantly
4. **TypeScript errors are your friend** - They catch bugs early
5. **Follow the mobile-first patterns** - See COMPONENT_GUIDELINES.md

## 🎉 You're Ready!

The app is running at **http://localhost:3000**

Try:
- 📱 Resize your browser to see mobile navigation
- 🔐 Sign in with any email (check console for magic link)
- 🎨 Navigate between pages using bottom nav
- 🚀 Start building features!

---

**Need help?** Check the docs or review the code - it's well-commented!

