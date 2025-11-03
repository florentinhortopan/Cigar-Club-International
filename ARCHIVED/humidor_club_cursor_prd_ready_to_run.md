# Humidor Club — Cursor PRD (Ready‑to‑Run)

A Cursor‑optimized, step‑by‑step plan to scaffold, implement, and ship a private cigar‑club web app with members, knowledge base, collectibles valuation, and an internal deals marketplace (negotiation‑only MVP).

---

## A. Goals & Guardrails
- **Goals**: Members & roles, cigar knowledge base (structured), collectibles tracking + simple Index, internal marketplace for WTS/WTB/WTT with offers/counters/messages, moderation, basic analytics.
- **Non‑Goals (MVP)**: On‑platform payments, shipping label generation, public SEO pages, automated counterfeit detection.
- **Constraints**: Private, 21+ age‑gated, invite‑only. Negotiation‑only marketplace.

---

## B. Tech Stack (Cursor‑friendly)
- **Frontend**: Next.js (App Router) + TypeScript, Tailwind, Shadcn UI (Radix)
- **Auth**: NextAuth (Email magic link; optional OAuth later)
- **DB**: PostgreSQL (Supabase or Neon) + Prisma ORM
- **Storage**: Supabase storage or Cloudflare R2
- **Search**: Postgres `pg_trgm` / FTS
- **Realtime (optional)**: Supabase Realtime for chat/offers
- **Deploy**: Vercel (web) + Supabase/Neon (DB)

---

## C. Ready‑to‑Run Repo Scaffold (copy/paste)

### C1. Prereqs
- Node 20+, pnpm, Git, a Postgres database URL (Supabase/Neon), email sender (Resend or SMTP), Vercel account.

### C2. Initialize project
```bash
pnpm create next-app humidor-club --ts --eslint --app --tailwind
cd humidor-club
pnpm add @prisma/client prisma next-auth zod axios zustand clsx tailwind-merge
pnpm add @radix-ui/react-dropdown-menu @radix-ui/react-dialog @radix-ui/react-avatar @radix-ui/react-tooltip @radix-ui/react-separator
pnpm add -D @types/node @types/react @types/bcrypt tailwindcss postcss autoprefixer prisma tsx @playwright/test vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### C3. Shadcn UI setup
```bash
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button input textarea dialog dropdown-menu badge card avatar tooltip separator label checkbox radio-group kbd sheet scroll-area alert textarea form toast toast-provider sonner skeleton
```

### C4. Prisma init
```bash
npx prisma init
```

### C5. Enable Postgres extensions (run in your DB)
```sql
create extension if not exists pg_trgm;
create extension if not exists unaccent;
```

---

## D. Environment (.env template)
Create `.env` in repo root:
```env
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme-long-random
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Email (pick one)
RESEND_API_KEY=your_resend_key
EMAIL_FROM="Humidor Club <no-reply@yourdomain.com>"
# or SMTP
EMAIL_SERVER=smtp://user:pass@smtp.host:587
EMAIL_FROM="Humidor Club <no-reply@yourdomain.com>"

# Storage (optional MVP)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=public_anon_key
```

---

## E. Data Model (Prisma) — paste into `prisma/schema.prisma`
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql" url = env("DATABASE_URL") }

enum Role { MEMBER TRUSTED_SELLER MODERATOR ADMIN }
enum ListingType { WTS WTB WTT }
enum ListingStatus { ACTIVE PENDING SOLD WITHDRAWN FROZEN }
enum OfferStatus { OPEN COUNTERED ACCEPTED DECLINED WITHDRAWN }

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  displayName     String
  role            Role     @default(MEMBER)
  city            String?
  region          String?
  ageConfirmedAt  DateTime?
  rulesAcceptedAt DateTime
  reputation      Int      @default(0)
  listings        Listing[]
  offers          Offer[]  @relation("UserOffers")
  notes           TastingNote[]
  pairings        PairingRating[]
  humidors        HumidorItem[]
  feedback        DealFeedback[] @relation("FeedbackFor")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Brand { id String @id @default(cuid()); name String @unique; lines Line[] }
model Line  { id String @id @default(cuid()); name String; brandId String; brand Brand @relation(fields:[brandId], references:[id]); cigars Cigar[] }

model Cigar {
  id        String @id @default(cuid())
  lineId    String
  line      Line   @relation(fields:[lineId], references:[id])
  factory   String?
  country   String?
  vitola    String?
  ringGauge Int?
  lengthMM  Int?
  wrapper   String?
  binder    String?
  filler    String?
  msrpCents Int?
  typicalStreetCents Int?
  releases  Release[]
  photos    Photo[]
  notes     TastingNote[]
  pairings  PairingAggregate[]
  createdAt DateTime @default(now())
}

model Release {
  id         String  @id @default(cuid())
  cigarId    String
  cigar      Cigar   @relation(fields:[cigarId], references:[id])
  boxCode    String?
  boxDate    DateTime?
  limitedRun Boolean  @default(false)
  marketStatus String?
  comps      Comp[]
  indexScore Float?
}

model TastingNote {
  id        String @id @default(cuid())
  userId    String
  cigarId   String
  rating    Float?
  aroma     String?
  draw      String?
  burn      String?
  strength  String?
  flavor    String?
  body      String?
  createdAt DateTime @default(now())
}

model PairingAggregate {
  id        String @id @default(cuid())
  cigarId   String
  beverage  String
  avgScore  Float  @default(0)
  votes     Int    @default(0)
}

model PairingRating {
  id        String @id @default(cuid())
  userId    String
  cigarId   String
  beverage  String
  score     Int
  note      String?
  createdAt DateTime @default(now())
}

model HumidorItem {
  id            String  @id @default(cuid())
  userId        String
  cigarId       String
  releaseId     String?
  qty           Int
  isCollectible Boolean @default(false)
  condition     String?
  provenance    String?
  acquiredAt    DateTime?
  acquiredCents Int?
}

model Comp {
  id         String   @id @default(cuid())
  releaseId  String
  source     String
  date       DateTime
  qty        Int
  condition  String?
  priceCents Int
  region     String?
}

model Listing {
  id          String        @id @default(cuid())
  userId      String
  type        ListingType
  title       String
  cigarId     String?
  releaseId   String?
  description String
  photos      Photo[]
  qty         Int
  condition   String?
  priceCents  Int?
  currency    String        @default("USD")
  region      String?
  meetUpOnly  Boolean       @default(true)
  status      ListingStatus @default(ACTIVE)
  offers      Offer[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Offer {
  id          String      @id @default(cuid())
  listingId   String
  fromUserId  String
  toUserId    String
  amountCents Int?
  message     String?
  status      OfferStatus @default(OPEN)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Message {
  id         String   @id @default(cuid())
  listingId  String
  fromUserId String
  toUserId   String
  body       String
  readAt     DateTime?
  createdAt  DateTime @default(now())
}

model DealFeedback {
  id        String @id @default(cuid())
  forUserId String @map("for_user_id")
  byUserId  String
  listingId String
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
  @@index([forUserId])
}

model Photo {
  id        String @id @default(cuid())
  url       String
  alt       String?
  listingId String?
  cigarId   String?
}
```

Then:
```bash
npx prisma migrate dev -n init
```

---

## F. Auth (NextAuth) — tasks
1. Add `@/lib/auth.ts` with Email provider (Resend or SMTP) + Prisma adapter.
2. Create `/app/api/auth/[...nextauth]/route.ts` with Email magic link.
3. Middleware: protect `(protected)` routes using `withAuth` or session check in layouts.
4. On first login, require **age attestation** and **rules acceptance** (store timestamps).

**Definition of Done**
- Magic link works locally; session accessible via `getServerSession`.
- Age/rules gating enforced before accessing protected pages.

---

## G. App Structure (App Router)
```
/app
  /(public)
    page.tsx               # landing (invite gate)
  /(auth)
    sign-in/page.tsx
  /(protected)
    layout.tsx             # requires session + age/rules
    dashboard/page.tsx
    cigars/page.tsx
    cigars/new/page.tsx
    cigars/[id]/page.tsx
    marketplace/page.tsx
    marketplace/new/page.tsx
    marketplace/[id]/page.tsx
    humidor/page.tsx
    inbox/page.tsx
    admin/page.tsx
  api/
    auth/[...nextauth]/route.ts
    search/route.ts
    cigars/route.ts
    cigars/[id]/route.ts
    cigars/[id]/notes/route.ts
    cigars/[id]/pairings/route.ts
    releases/[id]/comps/route.ts
    humidor/route.ts
    listings/route.ts
    listings/[id]/route.ts
    listings/[id]/offers/route.ts
    offers/[id]/accept/route.ts
    offers/[id]/decline/route.ts
    offers/[id]/counter/route.ts
    messages/[listingId]/route.ts
    mod/listings/[id]/freeze/route.ts
    mod/users/[id]/ban/route.ts
/lib, /components, /styles, /hooks
/prisma
```

---

## H. Feature Workstreams & Tasks

### H1. Member & Access
- [ ] Invite code support (`Invite` table optional; MVP: whitelisted domains or manual toggles)
- [ ] Profile page fields (displayName, city, region, badges viewport)
- [ ] Age attestation + rules modal on first login

### H2. Cigar Knowledge Base
- [ ] CRUD for Brand/Line/Cigar with de‑duplication (normalize Brand+Line)
- [ ] `CigarForm` with inline brand/line creation; required vitola/size when available
- [ ] Photo upload (Supabase/R2) + image compression client‑side
- [ ] Notes & Pairings tabs (structured facets + rich MD body)
- [ ] Search with filters: brand, line, country, vitola

### H3. Collectibles & Index
- [ ] Humidor page: add items from any Cigar/Release; qty, condition, provenance
- [ ] Comps entry UI (source/date/price/qty/condition)
- [ ] Nightly job (server action/cron) to compute `Release.indexScore` using last 90d comps (60/30/10 weighting)
- [ ] Release page: Index trend (7/30/90d), comps list, confidence = comps count

### H4. Marketplace (Negotiation‑only)
- [ ] Listing types: WTS/WTB/WTT with metadata (qty, condition, region, meet‑up flag)
- [ ] Listing grid + filters (type, region, price range, condition, badges)
- [ ] Offer workflow: make offer, counter, accept/decline, withdraw
- [ ] Per‑listing private messages thread with read receipts (optional)
- [ ] Deal status timeline; mark Completed/Withdrawn; post‑deal feedback prompt

### H5. Moderation & Safety
- [ ] Report content (user/listing/message)
- [ ] Moderator dashboard: queue (freeze listing, request proof, ban user)
- [ ] Audit log of actions (created, frozen, sold, banned)

### H6. Analytics (basic)
- [ ] Event helper; send events on auth, KB, marketplace actions
- [ ] Admin chart cards for DAU/WAU/MAU, listings/offer counts, completion rate

---

## I. API Endpoints — Acceptance Criteria
- **Search** `GET /api/search?q` returns mixed results (cigars/listings) with pagination.
- **Cigars** `POST /api/cigars`, `GET /api/cigars/:id`, `POST /api/cigars/:id/notes`, `POST /api/cigars/:id/pairings` enforce session & role; returns created entities.
- **Releases/Comps** `POST /api/releases/:id/comps` validates ownership/admin when needed.
- **Humidor** `GET/POST /api/humidor` scoped to session user.
- **Listings** `GET /api/listings` supports filters; `POST` creates listing; `PATCH` updates; status mutation endpoint works.
- **Offers** create/counter/accept/decline/withdraw update `Offer.status` and emit timeline events.
- **Messages** per listing; sender/recipient validation.
- **Moderation** endpoints restricted to Moderator/Admin.

---

## J. UI/UX — Shadcn Components Checklist
- Shell: sidebar + topbar (avatar, inbox, quick actions)
- Cigar pages: Card & table views; tabs (Notes, Pairings, Photos, Releases)
- Marketplace: Cards grid, filter drawer, listing detail with offer panel + messages
- Compose Listing: stepper (item → condition → qty/price → meet‑up → photos → review)
- Profile: badges, feedback list, activity
- Admin/Mod: reports queue, actions panel

---

## K. Search & Indexing
- Create GIN index on searchable text columns; use `unaccent(lower())` for normalization.
```sql
create index if not exists cigars_text_idx on "Cigar" using gin ((to_tsvector('simple', coalesce(wrapper,'') || ' ' || coalesce(binder,'') || ' ' || coalesce(filler,''))));
create index if not exists listings_title_idx on "Listing" using gin (to_tsvector('simple', title));
```
- Optional: `pg_trgm` for fuzzy match on brand/line.

---

## L. Valuation Index (formula)
- Per `Release`: median of `Comp.priceCents` over last 90d, weighted **60%** (0–30d), **30%** (31–60d), **10%** (61–90d).
- Store `indexScore`; display deltas vs 7/30/90d; show comps count as liquidity indicator.

---

## M. Seed Script (`prisma/seed.ts`)
- Creates: admin user, sample brands/lines/cigars, one release with comps, one listing + offer.
- Run: `pnpm prisma db seed` (set in `package.json`: `"prisma": { "seed": "tsx prisma/seed.ts" }`).
- **Task**: Implement realistic vitolas and 2–3 pairings to demo UI.

---

## N. Testing Strategy
- **Unit**: Vitest for utility functions (index calc, search parser).
- **Integration**: API route tests with Prisma test DB.
- **E2E**: Playwright flows: sign‑in, accept rules, create cigar, create listing, send offer, accept, leave feedback.
- CI: GitHub Actions with Postgres service; run `prisma migrate deploy` and tests.

---

## O. Milestones & Day‑by‑Day Plan (10 workdays)
**Day 1**: Repo scaffold, Tailwind/Shadcn, Prisma schema, migrate, auth skeleton.
**Day 2**: Age/rules gating, profile, invite gate; seed script v1.
**Day 3**: Cigar KB CRUD + photo upload; search v1.
**Day 4**: Notes/Pairings tabs with structured facets.
**Day 5**: Humidor page; collectibles flags; comps entry UI.
**Day 6**: Index compute job + display; release details.
**Day 7**: Marketplace CRUD; listing grid + filters.
**Day 8**: Offers + messages; deal timeline; mark completed; feedback.
**Day 9**: Moderation dashboard; reports; freeze/ban; audit log.
**Day 10**: Analytics cards; E2E tests; polish; deploy to Vercel + DB.

---

## P. Definition of Done (MVP)
- Invite‑only login + age/rules gating.
- Create/search/view cigars; add notes/pairings; upload photos.
- Humidor items saved per user; Index visible on releases with >=3 comps.
- Marketplace listings with offers/counters/messages; deals can complete; feedback saved.
- Moderation actions function (freeze, report, ban) with audit log.
- Basic analytics visible to Admin.
- Playwright E2E green for core flows.

---

## Q. Cursor “Vibe‑Coding” Prompts (paste as tasks)
1. **Scaffold UI Shell**: _“Create a sidebar + topbar layout using Shadcn. Protected layout reads NextAuth session; if missing `rulesAcceptedAt` or `ageConfirmedAt` show modal to complete and persist via API.”_
2. **Auth Email Provider**: _“Implement NextAuth with Email (Resend or SMTP) and Prisma adapter. Add sign‑in page and magic‑link flow.”_
3. **CigarForm**: _“Build `CigarForm` with inline brand/line creation; fields: vitola, size, wrapper/binder/filler, factory, country, MSRP/street; submit to `/api/cigars`. Use Zod schema + server actions.”_
4. **Notes & Pairings**: _“Implement tabs on Cigar page for Notes and Pairings. Notes capture aroma/draw/burn/strength/flavor + MD body. Pairings accept beverage string + 1–5 score; update `PairingAggregate`.”_
5. **Search**: _“Add search bar with server action calling `/api/search`. Implement Postgres FTS + pg_trgm for fuzzy brand/line; return cigars + listings.”_
6. **Humidor**: _“Create `HumidorPage` to add/remove items, set condition/provenance, qty, acquisition price/date. List totals and collectibles flag.”_
7. **Comps & Index**: _“Create UI to add comps to a release. Implement cron/server action to compute `indexScore` with 60/30/10 weighting over last 90 days. Show 7/30/90 deltas and comps count.”_
8. **Marketplace**: _“Create `ListingsPage` with filters (type, region, price range, condition, badges). Listing card shows title, qty, price, region, seller badges, and index reference if linked to release.”_
9. **Offers & Messaging**: _“On listing detail, implement offer panel with create/counter/accept/decline. Build per‑listing message thread with optimistic updates; optional Supabase Realtime.”_
10. **Feedback & Reputation**: _“After deal completed, show dialog to leave 1–5 rating + comment. Aggregate to profile reputation.”_
11. **Moderation**: _“Build Moderator dashboard with reports queue, freeze/ban actions; write audit log entries; gate via role.”_
12. **Analytics**: _“Add event helper; track auth/login, kb_add_cigar, listing_create, offer_accept, deal_complete; render small KPI cards on Admin.”_
13. **Tests**: _“Write Playwright E2E for sign‑in→rules→create cigar→create listing→offer→accept→feedback. Run in CI.”_

---

## R. GitHub Project & Issues (ready to paste)
**Columns**: Backlog → In Progress → Review → Done

**Issue titles** (open these as atomic tasks):
- Auth: Email magic link + Prisma adapter
- Age/rules gating modal + server routes
- Shell: Sidebar/Topbar + Protected layout
- Cigar: Prisma models, API routes, forms
- Cigar: Notes & Pairings tabs
- Search: FTS + pg_trgm + API
- Humidor: CRUD + table
- Releases: Comps + Index job + UI
- Marketplace: Listings grid + filters
- Listing detail: Offers workflow
- Listing detail: Messages thread
- Deals: Completed + Feedback + Reputation
- Moderation: Reports queue + Freeze/Ban + Audit
- Analytics: Event helper + Admin KPIs
- Tests: Playwright core flow
- Deploy: Vercel + DB + envs

---

## S. Runbook

### Local dev
```bash
pnpm dev
```

### Build
```bash
pnpm build && pnpm start
```

### Prisma
```bash
npx prisma migrate dev
npx prisma studio
```

### Seed
- Add `"prisma": { "seed": "tsx prisma/seed.ts" }` to `package.json`.
- Run `pnpm prisma db seed`.

### Deploy
- Vercel project → add env vars from `.env`.
- Supabase/Neon: run extensions (Section C5) + `prisma migrate deploy`.
- Set `NEXTAUTH_URL` to Vercel URL, rotate `NEXTAUTH_SECRET`.

---

## T. Policies & Copy (paste‑ready)
- **Age Gate**: “By entering, you confirm you are 21+ and agree to our club rules.”
- **Marketplace disclaimer**: “Humidor Club does not process payments or shipping. Members are solely responsible for private transactions and compliance with local laws.”
- **Counterfeit policy**: “Listings must be accurate and truthful. Provide clear photos and provenance. Counterfeits are grounds for immediate ban.”

---

## U. Nice‑to‑Have (Post‑MVP)
- ID verification for Trusted Seller
- Accessories escrow (non‑tobacco) only
- Price alerts & watchlists
- Events calendar + RSVPs
- Mobile shell via Expo/Next‑native

---

## V. Acceptance Test (manual checklist)
- [ ] New user signs in via email link, completes age/rules.
- [ ] Adds a cigar with photo, writes a note, adds a pairing rating.
- [ ] Adds humidor item; sees it listed with totals.
- [ ] Adds comps to a release; sees Index after job run.
- [ ] Creates WTS listing; another user sends offer; seller counters; buyer accepts.
- [ ] Both leave feedback; reputation updates.
- [ ] Moderator freezes a suspicious listing; audit log records action.

---

## W. Troubleshooting Notes
- Magic link emails often blocked locally: use Resend or `mailhog` SMTP during dev.
- Prisma relation errors → run `npx prisma format` then `migrate dev`.
- If images fail: verify Supabase bucket CORS and public read policy for demo.

---

**You’re set.** Start with Section C, then work down the Q‑prompts in Cursor. Ship MVP in ~10 focused days.

