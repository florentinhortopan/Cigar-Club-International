# 📖 Quick Reference Guide

Your one-stop reference for the Humidor Club project.

---

## 🎯 Project Overview

**Humidor Club** is a private, mobile-first cigar club platform with:
- SurrealDB database (graph + document + relational)
- Next.js 15 frontend (mobile-first PWA)
- Open Notebook AI integration (natural language queries)
- Age-gated, invite-only membership

---

## 📁 Important Files & Locations

### Documentation

| File | Purpose |
|------|---------|
| [`GET_STARTED.md`](./GET_STARTED.md) | Main starting guide |
| [`ARCHITECTURE_PIVOT_SUMMARY.md`](./ARCHITECTURE_PIVOT_SUMMARY.md) | **Read this!** Complete architecture overview |
| [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) | PostgreSQL → SurrealDB migration |
| [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) | Original implementation details |

### Technical Docs

| File | Purpose |
|------|---------|
| [`docs/ARCHITECTURE_UPDATED.md`](./docs/ARCHITECTURE_UPDATED.md) | Complete technical architecture |
| [`docs/OPEN_NOTEBOOK_INTEGRATION.md`](./docs/OPEN_NOTEBOOK_INTEGRATION.md) | AI integration guide |
| [`docs/PRD_ENHANCED.md`](./docs/PRD_ENHANCED.md) | Product requirements |
| [`docs/API_SPECIFICATION.md`](./docs/API_SPECIFICATION.md) | API reference |
| [`docs/COMPONENT_GUIDELINES.md`](./docs/COMPONENT_GUIDELINES.md) | Component patterns |
| [`docs/TESTING_GUIDE.md`](./docs/TESTING_GUIDE.md) | Testing strategies |

### Code

| Location | Contents |
|----------|----------|
| `humidor-club/` | Main Next.js application |
| `humidor-club/database/schema.surql` | **SurrealDB schema** (use this!) |
| `humidor-club/lib/surrealdb.ts` | Database client |
| `humidor-club/lib/` | Core utilities |
| `humidor-club/components/` | React components |

---

## 🚀 Quick Start (Updated for SurrealDB)

### 1. Install SurrealDB

```bash
# macOS
brew install surrealdb/tap/surreal

# Linux
curl -sSf https://install.surrealdb.com | sh

# Docker
docker run -p 8000:8000 surrealdb/surrealdb:latest start
```

### 2. Start SurrealDB

```bash
surreal start --log info --user root --pass root file://humidor.db
```

### 3. Load Schema

```bash
cd humidor-club
surreal import --conn http://localhost:8000 \
  --user root --pass root \
  --ns humidor_club --db production \
  database/schema.surql
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
# SurrealDB (not PostgreSQL!)
SURREALDB_URL=ws://localhost:8000/rpc
SURREALDB_NAMESPACE=humidor_club
SURREALDB_DATABASE=production
SURREALDB_USER=root
SURREALDB_PASS=root

# Open Notebook (optional but recommended)
OPEN_NOTEBOOK_URL=http://localhost:8080
OPENAI_API_KEY=sk-...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl>

# Storage
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

### 5. Install Dependencies

```bash
cd humidor-club
pnpm install
pnpm add surrealdb.js  # Add SurrealDB client
```

### 6. Start Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🤖 Open Notebook Setup (Optional)

### Install Open Notebook

```bash
# Clone repo
git clone https://github.com/lfnovo/open-notebook
cd open-notebook

# Install
pip install -r requirements.txt

# Configure
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_TYPE=surrealdb
SURREALDB_URL=ws://localhost:8000/rpc
SURREALDB_NAMESPACE=humidor_club
SURREALDB_DATABASE=production
OPENAI_API_KEY=sk-...
```

### Start Open Notebook

```bash
python run_api.py
```

Open Notebook will be available at `http://localhost:8080`

---

## 📱 Mobile-First Principles

### 1. Touch Targets

Minimum 44x44px for all interactive elements:

```tsx
<Button className="min-h-[44px] min-w-[44px]" />
```

### 2. Bottom Navigation

Primary navigation at bottom for thumb reach:

```tsx
<nav className="fixed bottom-0">
  <NavItem icon="home" />
  <NavItem icon="search" />
  <NavItem icon="plus" />     {/* Center, larger */}
  <NavItem icon="humidor" />
  <NavItem icon="profile" />
</nav>
```

### 3. Bottom Sheets

Use for actions and forms on mobile:

```tsx
<BottomSheet trigger={<Button>Add</Button>}>
  <AddToHumidorForm />
</BottomSheet>
```

### 4. Responsive Grid

Stack on mobile, expand on desktop:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

## 🎯 Cigar Terminology

### Hierarchy

```
Brand (Manufacturer)
  └─> Line (Product Series)
      └─> Cigar (Vitola/Shape)
          └─> Release (Production Batch)
```

### Key Terms

| Term | Definition | Example |
|------|------------|---------|
| **Vitola** | Shape/size name | Robusto, Toro, Churchill |
| **Ring Gauge** | Diameter in 64ths of inch | 50 = 50/64" |
| **Wrapper** | Outer leaf | Maduro, Connecticut |
| **Binder** | Holds filler together | Nicaraguan |
| **Filler** | Interior tobacco blend | ["Nicaraguan", "Dominican"] |
| **Strength** | Nicotine intensity | Mild, Medium, Full |
| **Body** | Flavor intensity | Light, Medium, Full |
| **Box Code** | Factory identifier | "PAD26R" |

### Example: Full Cigar Data

```typescript
{
  brand: "Padrón",
  line: "1926 Series",
  vitola: "Robusto",
  ringGauge: 50,
  lengthMM: 127,
  wrapper: "Maduro",
  strength: "Full",
  body: "Full"
}
```

---

## 🔍 Common Queries

### SurrealDB

```surrealql
-- Find all Padrón cigars
SELECT * FROM cigar
WHERE line.brand.name = "Padrón";

-- User's humidor
SELECT * FROM humidor_item
WHERE user = $auth.id;

-- Undervalued listings
SELECT * FROM listing
WHERE price_cents < (
  SELECT math::mean(price_cents) FROM comp 
  WHERE release = listing.release
) * 0.85;
```

### Natural Language (via Open Notebook)

```typescript
await openNotebook.query({
  prompt: "What Padrón cigars do I have that pair well with coffee?",
  userId: user.id
});

await openNotebook.query({
  prompt: "Recommend a full-bodied cigar I haven't tried",
  userId: user.id
});

await openNotebook.query({
  prompt: "Are there any good deals on Cuban cigars?",
  userId: user.id
});
```

---

## 🛠️ Common Commands

### Development

```bash
# Start dev server
pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint

# Format
pnpm format
```

### Database

```bash
# Start SurrealDB
surreal start file://humidor.db

# Import schema
surreal import database/schema.surql

# SQL shell
surreal sql --conn http://localhost:8000
```

### Testing

```bash
# All tests
pnpm test

# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.3+ |
| **Database** | SurrealDB |
| **AI** | Open Notebook |
| **Styling** | Tailwind CSS 4 |
| **Components** | Shadcn UI (Radix) |
| **Auth** | NextAuth.js |
| **Storage** | Supabase Storage |
| **Testing** | Vitest + Playwright |
| **Deployment** | Vercel |

---

## 🔗 External Resources

### Official Docs

- [SurrealDB Docs](https://surrealdb.com/docs)
- [Open Notebook](https://github.com/lfnovo/open-notebook)
- [Next.js Docs](https://nextjs.org/docs)
- [Shadcn UI](https://ui.shadcn.com)

### Learning

- [SurrealDB Tutorial](https://surrealdb.com/docs/surrealql)
- [Mobile-First Design](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [React Server Components](https://react.dev/reference/rsc/server-components)

---

## 🆘 Troubleshooting

### SurrealDB won't start

```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>

# Start again
surreal start file://humidor.db
```

### Connection errors

```bash
# Test connection
curl http://localhost:8000/health

# Check logs
surreal start --log debug file://humidor.db
```

### Open Notebook not responding

```bash
# Check if running
curl http://localhost:8080/health

# Restart
python run_api.py
```

---

## 📞 Getting Help

1. Check relevant documentation file (see table above)
2. Review example queries and code
3. Check troubleshooting section
4. Review SurrealDB/Open Notebook docs

---

## ⚡ Quick Navigation

| I want to... | Go to... |
|--------------|----------|
| **Understand the architecture** | [`ARCHITECTURE_PIVOT_SUMMARY.md`](./ARCHITECTURE_PIVOT_SUMMARY.md) |
| **Set up the database** | [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) |
| **Integrate AI chat** | [`docs/OPEN_NOTEBOOK_INTEGRATION.md`](./docs/OPEN_NOTEBOOK_INTEGRATION.md) |
| **Build mobile components** | [`docs/ARCHITECTURE_UPDATED.md`](./docs/ARCHITECTURE_UPDATED.md) |
| **Understand API patterns** | [`docs/API_SPECIFICATION.md`](./docs/API_SPECIFICATION.md) |
| **Write tests** | [`docs/TESTING_GUIDE.md`](./docs/TESTING_GUIDE.md) |
| **Deploy to production** | [`docs/PRD_ENHANCED.md`](./docs/PRD_ENHANCED.md) Section L |

---

**Everything you need is in this repository. Happy coding!** 🚀

