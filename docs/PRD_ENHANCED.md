# Humidor Club — Enhanced PRD v2.0 (Production-Ready)

A comprehensive, production-grade specification for building a private cigar-club web application with members, knowledge base, collectibles valuation, and internal marketplace.

---

## Table of Contents
1. [Goals & Guardrails](#a-goals--guardrails)
2. [Tech Stack](#b-tech-stack)
3. [Security & Privacy](#c-security--privacy)
4. [Data Model](#d-data-model)
5. [Architecture](#e-architecture)
6. [Feature Workstreams](#f-feature-workstreams)
7. [API Specifications](#g-api-specifications)
8. [Performance & Caching](#h-performance--caching)
9. [Monitoring & Observability](#i-monitoring--observability)
10. [Accessibility](#j-accessibility)
11. [Testing Strategy](#k-testing-strategy)
12. [Deployment](#l-deployment)
13. [Milestones](#m-milestones)

---

## A. Goals & Guardrails

### Goals
- **Member Management**: Role-based access (Member, Trusted Seller, Moderator, Admin)
- **Knowledge Base**: Structured cigar database (Brand → Line → Cigar → Release)
- **Collectibles Tracking**: Personal humidor with valuation index
- **Marketplace**: WTS/WTB/WTT negotiation-only platform with offers/counters
- **Moderation**: Report system, content freeze, user management
- **Analytics**: Basic KPIs for platform health

### Non-Goals (MVP)
- ❌ On-platform payments or escrow
- ❌ Shipping label generation
- ❌ Public SEO pages (private club only)
- ❌ Automated counterfeit detection (manual moderation)
- ❌ Mobile native apps (responsive web first)

### Constraints
- **Age-gated**: 21+ attestation required
- **Invite-only**: Closed membership model
- **Private**: All content behind authentication
- **Negotiation-only**: No payment processing

---

## B. Tech Stack

### Core
- **Frontend**: Next.js 15 (App Router) + TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4 + Shadcn UI (Radix primitives)
- **Auth**: NextAuth.js v5 (Email magic link + OAuth ready)
- **Database**: PostgreSQL 15+ (Supabase or Neon)
- **ORM**: Prisma 5.x with middleware
- **Storage**: Supabase Storage or Cloudflare R2
- **Search**: PostgreSQL `pg_trgm` + Full-Text Search
- **Real-time**: Supabase Realtime (optional for MVP)

### Supporting
- **Validation**: Zod 3.x
- **State Management**: Zustand (UI state only)
- **Data Fetching**: SWR or TanStack Query
- **Email**: Resend or SMTP (Nodemailer)
- **Image Processing**: Sharp (server-side)
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics + custom events

### Dev Tools
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions

---

## C. Security & Privacy

### C1. Authentication & Authorization

#### Session Management
```typescript
// Session configuration
{
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60,    // Refresh daily
}
```

#### Rate Limiting
- **Auth endpoints**: 5 attempts per 15 minutes per IP
- **API routes**: 100 requests per minute per user
- **Search**: 20 requests per minute per user
- **Image upload**: 10 uploads per hour per user

Implementation:
```typescript
// lib/rate-limit.ts using Upstash Redis or in-memory store
import { Ratelimit } from "@upstash/ratelimit";
```

#### Authorization Middleware
```typescript
// lib/auth-guard.ts
export const roles = {
  MEMBER: 0,
  TRUSTED_SELLER: 10,
  MODERATOR: 50,
  ADMIN: 100,
} as const;

export function requireRole(minRole: keyof typeof roles) {
  return async (req: Request) => {
    const session = await getServerSession();
    if (!session) throw new UnauthorizedError();
    if (roles[session.user.role] < roles[minRole]) {
      throw new ForbiddenError();
    }
    return session;
  };
}
```

### C2. Data Protection

#### Input Sanitization
- **All user inputs**: Zod validation at API boundaries
- **Rich text**: DOMPurify for HTML (notes, descriptions)
- **File uploads**: MIME type validation + magic number verification
- **SQL injection**: Prisma parameterized queries (safe by default)

#### File Upload Security
```typescript
// lib/upload-validator.ts
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_LISTING = 8;

// Strip EXIF data for privacy
export async function processUpload(file: File) {
  const buffer = await file.arrayBuffer();
  return sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .withMetadata({ exif: {} }) // Strip EXIF
    .webp({ quality: 85 })
    .toBuffer();
}
```

#### XSS Prevention
- React escapes by default
- Use `dangerouslySetInnerHTML` only with sanitized content
- CSP headers in `next.config.js`

#### CSRF Protection
```typescript
// middleware.ts - Built-in Next.js protection for mutations
export const config = {
  matcher: ['/api/:path*'],
};
```

### C3. GDPR & Privacy Compliance

#### Required Pages
- [ ] Privacy Policy (`/privacy`)
- [ ] Terms of Service (`/terms`)
- [ ] Cookie Policy (`/cookies`)
- [ ] Community Guidelines (`/guidelines`)

#### User Rights
```typescript
// API routes required
- GET  /api/user/data-export    // Download all user data (JSON)
- POST /api/user/data-deletion  // Right to be forgotten
- GET  /api/user/consent        // View consent history
- POST /api/user/consent        // Update consent preferences
```

#### Data Retention
- **Active users**: Indefinite
- **Deleted accounts**: 30-day soft delete, then purge
- **Audit logs**: 2 years
- **Messages**: 1 year after deal completion
- **Photos**: Deleted with listing/account

---

## D. Data Model

### D1. Enhanced Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum Role {
  MEMBER
  TRUSTED_SELLER
  MODERATOR
  ADMIN
}

enum ListingType {
  WTS  // Want to Sell
  WTB  // Want to Buy
  WTT  // Want to Trade
}

enum ListingStatus {
  DRAFT
  ACTIVE
  PENDING
  SOLD
  WITHDRAWN
  FROZEN
}

enum OfferStatus {
  OPEN
  COUNTERED
  ACCEPTED
  DECLINED
  WITHDRAWN
}

enum ReportStatus {
  PENDING
  REVIEWED
  RESOLVED
  DISMISSED
}

enum ReportType {
  LISTING
  USER
  MESSAGE
}

enum AuditAction {
  USER_CREATED
  USER_BANNED
  USER_UNBANNED
  LISTING_CREATED
  LISTING_FROZEN
  LISTING_SOLD
  OFFER_ACCEPTED
  REPORT_FILED
  COMP_ADDED
}

// Core Models
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  displayName     String
  role            Role      @default(MEMBER)
  city            String?
  region          String?
  country         String?
  
  // Gating
  ageConfirmedAt  DateTime?
  rulesAcceptedAt DateTime?
  inviteCode      String?
  
  // Reputation
  reputation      Int       @default(0)
  verifiedAt      DateTime? // Trusted Seller verification
  
  // Privacy
  emailVerified   DateTime?
  deletedAt       DateTime? // Soft delete
  
  // Relations
  listings        Listing[]
  offers          Offer[]   @relation("UserOffers")
  sentMessages    Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  notes           TastingNote[]
  pairings        PairingRating[]
  humidorItems    HumidorItem[]
  feedbackGiven   DealFeedback[] @relation("FeedbackBy")
  feedbackReceived DealFeedback[] @relation("FeedbackFor")
  reports         Report[]  @relation("ReportedBy")
  auditLogs       AuditLog[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([email, deletedAt])
  @@index([role])
  @@index([reputation])
}

model InviteCode {
  id          String    @id @default(cuid())
  code        String    @unique
  createdById String
  usedById    String?
  usedAt      DateTime?
  expiresAt   DateTime?
  maxUses     Int       @default(1)
  currentUses Int       @default(0)
  createdAt   DateTime  @default(now())
  
  @@index([code, usedAt])
}

// Knowledge Base
model Brand {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  country     String?
  founded     Int?
  website     String?
  logoUrl     String?
  lines       Line[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([slug])
}

model Line {
  id          String   @id @default(cuid())
  name        String
  slug        String
  brandId     String
  brand       Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  description String?
  releaseYear Int?
  discontinued Boolean  @default(false)
  cigars      Cigar[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([brandId, slug])
  @@index([brandId])
}

model Cigar {
  id        String   @id @default(cuid())
  lineId    String
  line      Line     @relation(fields: [lineId], references: [id], onDelete: Cascade)
  
  // Details
  vitola    String
  factory   String?
  country   String?
  
  // Dimensions
  ringGauge Int?
  lengthMM  Int?
  
  // Composition
  wrapper   String?
  binder    String?
  filler    String?
  
  // Pricing (cents)
  msrpCents          Int?
  typicalStreetCents Int?
  
  // Characteristics
  strength  String? // Mild, Medium, Full
  body      String? // Light, Medium, Full
  
  // Relations
  releases  Release[]
  photos    Photo[]
  notes     TastingNote[]
  pairings  PairingAggregate[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([lineId])
  @@index([vitola])
  @@index([country])
}

model Release {
  id           String   @id @default(cuid())
  cigarId      String
  cigar        Cigar    @relation(fields: [cigarId], references: [id], onDelete: Cascade)
  
  // Release Info
  boxCode      String?
  boxDate      DateTime?
  year         Int?
  limitedRun   Boolean  @default(false)
  productionQty Int?
  
  // Valuation
  indexScore   Float?    // Computed valuation
  indexDelta7d Float?    // 7-day change
  indexDelta30d Float?   // 30-day change
  indexDelta90d Float?   // 90-day change
  lastIndexCalc DateTime?
  
  marketStatus String?   // "Active", "Retired", "Rare"
  
  // Relations
  comps        Comp[]
  humidorItems HumidorItem[]
  listings     Listing[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([cigarId])
  @@index([indexScore])
  @@index([year])
}

// Tasting & Pairings
model TastingNote {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cigarId   String
  cigar     Cigar    @relation(fields: [cigarId], references: [id], onDelete: Cascade)
  
  // Ratings (1-5)
  rating    Float?
  
  // Structured
  aroma     String?  // Faceted: "Cedar, Leather, Coffee"
  draw      String?  // "Tight", "Perfect", "Loose"
  burn      String?  // "Uneven", "Good", "Perfect"
  strength  String?  // "Mild", "Medium", "Full"
  body      String?  // "Light", "Medium", "Full"
  
  // Rich text
  flavor    String?  @db.Text
  notes     String?  @db.Text
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([cigarId])
  @@index([rating])
}

model PairingAggregate {
  id        String @id @default(cuid())
  cigarId   String
  cigar     Cigar  @relation(fields: [cigarId], references: [id], onDelete: Cascade)
  beverage  String
  avgScore  Float  @default(0)
  votes     Int    @default(0)
  
  @@unique([cigarId, beverage])
  @@index([cigarId])
}

model PairingRating {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cigarId   String
  beverage  String
  score     Int      // 1-5
  note      String?
  createdAt DateTime @default(now())
  
  @@unique([userId, cigarId, beverage])
  @@index([cigarId, beverage])
}

// Humidor & Collectibles
model HumidorItem {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cigarId       String
  releaseId     String?
  release       Release? @relation(fields: [releaseId], references: [id], onDelete: SetNull)
  
  qty           Int
  isCollectible Boolean  @default(false)
  condition     String?  // "Mint", "Good", "Fair"
  provenance    String?  @db.Text
  storage       String?  // Humidor conditions
  
  acquiredAt    DateTime?
  acquiredCents Int?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId])
  @@index([cigarId])
  @@index([isCollectible])
}

// Comps (Price History)
model Comp {
  id         String   @id @default(cuid())
  releaseId  String
  release    Release  @relation(fields: [releaseId], references: [id], onDelete: Cascade)
  
  source     String   // "eBay", "Auction", "Private Sale"
  date       DateTime
  qty        Int
  condition  String?
  priceCents Int
  currency   String   @default("USD")
  region     String?
  url        String?
  
  verified   Boolean  @default(false)
  addedById  String?
  
  createdAt  DateTime @default(now())
  
  @@index([releaseId, date])
  @@index([date])
}

// Marketplace
model Listing {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        ListingType
  title       String
  description String        @db.Text
  
  // Reference
  cigarId     String?
  releaseId   String?
  release     Release?      @relation(fields: [releaseId], references: [id], onDelete: SetNull)
  
  // Details
  qty         Int
  condition   String?
  priceCents  Int?
  currency    String        @default("USD")
  
  // Location
  region      String?
  city        String?
  meetUpOnly  Boolean       @default(true)
  willShip    Boolean       @default(false)
  
  // Status
  status      ListingStatus @default(DRAFT)
  publishedAt DateTime?
  soldAt      DateTime?
  frozenAt    DateTime?
  frozenReason String?
  
  // Relations
  photos      Photo[]
  offers      Offer[]
  messages    Message[]
  reports     Report[]
  
  // Metrics
  viewCount   Int           @default(0)
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  @@index([userId, status])
  @@index([status, publishedAt])
  @@index([type, status, region])
  @@index([releaseId])
}

model Offer {
  id          String      @id @default(cuid())
  listingId   String
  listing     Listing     @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  fromUserId  String
  fromUser    User        @relation("UserOffers", fields: [fromUserId], references: [id], onDelete: Cascade)
  toUserId    String
  
  amountCents Int?
  message     String?     @db.Text
  
  status      OfferStatus @default(OPEN)
  parentId    String?     // For counter-offers
  
  acceptedAt  DateTime?
  declinedAt  DateTime?
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([listingId, status])
  @@index([fromUserId, status])
  @@index([toUserId, status])
}

model Message {
  id         String    @id @default(cuid())
  listingId  String
  listing    Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  fromUserId String
  fromUser   User      @relation("SentMessages", fields: [fromUserId], references: [id], onDelete: Cascade)
  toUserId   String
  toUser     User      @relation("ReceivedMessages", fields: [toUserId], references: [id], onDelete: Cascade)
  
  body       String    @db.Text
  readAt     DateTime?
  
  createdAt  DateTime  @default(now())
  
  @@index([listingId, createdAt])
  @@index([toUserId, readAt])
}

model DealFeedback {
  id        String   @id @default(cuid())
  
  forUserId String
  forUser   User     @relation("FeedbackFor", fields: [forUserId], references: [id], onDelete: Cascade)
  
  byUserId  String
  byUser    User     @relation("FeedbackBy", fields: [byUserId], references: [id], onDelete: Cascade)
  
  listingId String
  rating    Int      // 1-5
  comment   String?  @db.Text
  
  // Facets
  communication Boolean? // Good/Bad
  packaging     Boolean? // Good/Bad
  accuracy      Boolean? // Item as described
  
  createdAt DateTime @default(now())
  
  @@index([forUserId])
  @@index([listingId])
}

// Moderation
model Report {
  id          String       @id @default(cuid())
  type        ReportType
  
  reportedById String
  reportedBy   User        @relation("ReportedBy", fields: [reportedById], references: [id], onDelete: Cascade)
  
  listingId   String?
  listing     Listing?    @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  reason      String
  details     String?     @db.Text
  
  status      ReportStatus @default(PENDING)
  reviewedById String?
  reviewedAt  DateTime?
  resolution  String?     @db.Text
  
  createdAt   DateTime    @default(now())
  
  @@index([status, createdAt])
  @@index([listingId])
}

model AuditLog {
  id         String      @id @default(cuid())
  action     AuditAction
  
  userId     String?
  user       User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  targetType String?     // "Listing", "User", "Offer"
  targetId   String?
  
  metadata   Json?       // Flexible data storage
  ipAddress  String?
  userAgent  String?
  
  createdAt  DateTime    @default(now())
  
  @@index([action, createdAt])
  @@index([userId])
  @@index([targetType, targetId])
}

// Media
model Photo {
  id        String   @id @default(cuid())
  url       String
  key       String   // Storage key for deletion
  alt       String?
  width     Int?
  height    Int?
  size      Int?     // bytes
  
  listingId String?
  listing   Listing? @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  cigarId   String?
  cigar     Cigar?   @relation(fields: [cigarId], references: [id], onDelete: Cascade)
  
  uploadedById String?
  
  createdAt DateTime @default(now())
  
  @@index([listingId])
  @@index([cigarId])
}

// Analytics Events (optional - can use external service)
model Event {
  id         String   @id @default(cuid())
  name       String   // "user_signup", "listing_created", "offer_accepted"
  userId     String?
  sessionId  String?
  properties Json?
  createdAt  DateTime @default(now())
  
  @@index([name, createdAt])
  @@index([userId])
}
```

### D2. Database Indexes Strategy

```sql
-- Full-text search indexes
CREATE INDEX IF NOT EXISTS cigars_fts_idx ON "Cigar" 
  USING gin(to_tsvector('simple', 
    coalesce(vitola,'') || ' ' || 
    coalesce(wrapper,'') || ' ' || 
    coalesce(binder,'') || ' ' || 
    coalesce(filler,'')
  ));

CREATE INDEX IF NOT EXISTS listings_fts_idx ON "Listing" 
  USING gin(to_tsvector('simple', 
    title || ' ' || description
  ));

-- Trigram indexes for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS brands_trgm_idx ON "Brand" 
  USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS lines_trgm_idx ON "Line" 
  USING gin(name gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS listings_marketplace_idx ON "Listing" 
  (status, type, region, "publishedAt" DESC);

CREATE INDEX IF NOT EXISTS offers_active_idx ON "Offer" 
  (status, "createdAt" DESC) 
  WHERE status IN ('OPEN', 'COUNTERED');

CREATE INDEX IF NOT EXISTS messages_unread_idx ON "Message" 
  ("toUserId", "readAt") 
  WHERE "readAt" IS NULL;
```

---

## E. Architecture

### E1. Project Structure

```
humidor-club/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Landing/invite gate
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── guidelines/page.tsx
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-out/page.tsx
│   │   └── verify/page.tsx          # Email verification
│   ├── (onboarding)/
│   │   ├── layout.tsx               # Requires session
│   │   ├── age-gate/page.tsx
│   │   └── rules/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx               # Requires full access
│   │   ├── dashboard/page.tsx
│   │   ├── cigars/
│   │   │   ├── page.tsx             # Browse/search
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx         # Cigar detail
│   │   │   │   ├── edit/page.tsx
│   │   │   │   └── releases/[releaseId]/page.tsx
│   │   ├── marketplace/
│   │   │   ├── page.tsx             # Listings grid
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx         # Listing detail
│   │   │   │   └── edit/page.tsx
│   │   ├── humidor/
│   │   │   ├── page.tsx
│   │   │   └── add/page.tsx
│   │   ├── inbox/
│   │   │   ├── page.tsx
│   │   │   └── [listingId]/page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx             # Own profile
│   │   │   ├── edit/page.tsx
│   │   │   └── [userId]/page.tsx    # Public profile
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── invites/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── search/route.ts
│   │   ├── cigars/
│   │   │   ├── route.ts             # GET, POST
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts         # GET, PATCH, DELETE
│   │   │   │   ├── notes/route.ts
│   │   │   │   └── pairings/route.ts
│   │   ├── releases/
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   ├── comps/route.ts
│   │   │   │   └── index/route.ts   # Compute valuation
│   │   ├── humidor/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── listings/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   ├── offers/route.ts
│   │   │   │   └── messages/route.ts
│   │   ├── offers/
│   │   │   └── [id]/
│   │   │       ├── accept/route.ts
│   │   │       ├── decline/route.ts
│   │   │       ├── counter/route.ts
│   │   │       └── withdraw/route.ts
│   │   ├── feedback/route.ts
│   │   ├── reports/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── mod/
│   │   │   ├── listings/[id]/freeze/route.ts
│   │   │   └── users/[id]/ban/route.ts
│   │   ├── admin/
│   │   │   ├── invites/route.ts
│   │   │   ├── stats/route.ts
│   │   │   └── users/route.ts
│   │   ├── upload/route.ts
│   │   └── webhook/route.ts         # Cron jobs
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── loading.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                          # Shadcn components
│   ├── common/
│   │   ├── auth-guard.tsx
│   │   ├── role-guard.tsx
│   │   ├── error-boundary.tsx
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── topbar.tsx
│   │       └── mobile-nav.tsx
│   ├── features/
│   │   ├── cigars/
│   │   │   ├── cigar-card.tsx
│   │   │   ├── cigar-form.tsx
│   │   │   ├── cigar-search.tsx
│   │   │   ├── tasting-note-form.tsx
│   │   │   └── pairing-form.tsx
│   │   ├── marketplace/
│   │   │   ├── listing-card.tsx
│   │   │   ├── listing-form.tsx
│   │   │   ├── listing-filters.tsx
│   │   │   ├── offer-panel.tsx
│   │   │   └── message-thread.tsx
│   │   ├── humidor/
│   │   │   ├── humidor-table.tsx
│   │   │   └── add-item-form.tsx
│   │   ├── profile/
│   │   │   ├── profile-card.tsx
│   │   │   ├── reputation-badge.tsx
│   │   │   └── feedback-list.tsx
│   │   └── admin/
│   │       ├── reports-queue.tsx
│   │       ├── user-table.tsx
│   │       └── analytics-card.tsx
│   └── providers/
│       ├── session-provider.tsx
│       ├── toast-provider.tsx
│       └── theme-provider.tsx
├── lib/
│   ├── auth.ts                      # NextAuth config
│   ├── auth-guard.ts                # Role guards
│   ├── prisma.ts                    # Prisma client
│   ├── env.ts                       # Env validation
│   ├── errors.ts                    # Error classes
│   ├── api.ts                       # API response helpers
│   ├── rate-limit.ts                # Rate limiting
│   ├── upload.ts                    # File upload utils
│   ├── search.ts                    # Search helpers
│   ├── valuation.ts                 # Index calculation
│   ├── email.ts                     # Email sending
│   ├── logger.ts                    # Structured logging
│   ├── analytics.ts                 # Event tracking
│   └── utils.ts                     # General utilities
├── hooks/
│   ├── use-session.ts
│   ├── use-toast.ts
│   ├── use-debounce.ts
│   └── use-intersection-observer.ts
├── styles/
│   └── globals.css
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   ├── images/
│   └── favicon.ico
├── .env.example
├── .env.local
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── package.json
```

### E2. Component Architecture

#### Server Components (Default)
Use for:
- Page layouts
- Initial data fetching
- Static content
- SEO metadata

```typescript
// app/(protected)/cigars/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export default async function CigarPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  const cigar = await prisma.cigar.findUnique({
    where: { id: params.id },
    include: { line: { include: { brand: true } }, photos: true },
  });
  
  return <CigarDetail cigar={cigar} session={session} />;
}
```

#### Client Components
Use 'use client' for:
- Interactive forms
- Real-time updates
- Optimistic UI
- Event handlers
- Browser APIs

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function OfferForm({ listingId }: { listingId: string }) {
  const [amount, setAmount] = useState('');
  const router = useRouter();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/listings/${listingId}/offers`, {
      method: 'POST',
      body: JSON.stringify({ amountCents: parseFloat(amount) * 100 }),
    });
    router.refresh();
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### E3. State Management

```typescript
// store/ui-store.ts - Zustand for UI state only
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// For server data: Use SWR or TanStack Query
import useSWR from 'swr';

export function useListings(filters: ListingFilters) {
  const { data, error, mutate } = useSWR(
    ['/api/listings', filters],
    ([url, filters]) => fetch(url + '?' + new URLSearchParams(filters)).then(r => r.json())
  );
  
  return { listings: data, isLoading: !error && !data, mutate };
}
```

---

## F. Feature Workstreams

### F1. Member & Access Control
- [ ] Invite code system with tracking
- [ ] Age attestation modal (stores `ageConfirmedAt`)
- [ ] Rules acceptance modal (stores `rulesAcceptedAt`)
- [ ] Profile page with badges and reputation
- [ ] Email verification flow
- [ ] Account deletion (soft delete)

**DoD**: User can sign in via magic link, complete gating, view profile

### F2. Cigar Knowledge Base
- [ ] Brand/Line/Cigar CRUD with de-duplication
- [ ] Inline brand/line creation in CigarForm
- [ ] Photo upload with compression and EXIF stripping
- [ ] Tasting notes with structured facets
- [ ] Pairing ratings with aggregate scores
- [ ] Full-text search with filters
- [ ] Cigar detail page with tabs

**DoD**: Add cigar, upload photo, write note, add pairing, search cigars

### F3. Collectibles & Valuation
- [ ] Humidor page: add/edit/remove items
- [ ] Collectibles flag and condition tracking
- [ ] Comps entry UI with validation
- [ ] Nightly cron job to compute `indexScore`
- [ ] Release detail page with index trend chart
- [ ] 7/30/90-day delta calculations
- [ ] Confidence indicator (comps count)

**DoD**: Add humidor item, enter comps, view index with historical data

### F4. Marketplace
- [ ] Listing types: WTS/WTB/WTT
- [ ] Listing form with stepper UI
- [ ] Photo upload (max 8)
- [ ] Listing grid with filters (type, region, price, condition)
- [ ] Listing detail page
- [ ] View counter
- [ ] Draft status support

**DoD**: Create listing, publish, filter marketplace, view listing

### F5. Offers & Negotiation
- [ ] Make offer on listing
- [ ] Counter-offer flow
- [ ] Accept/decline offer
- [ ] Withdraw offer
- [ ] Offer history timeline
- [ ] Notification system
- [ ] Deal completion flow
- [ ] Post-deal feedback prompt

**DoD**: Send offer, counter, accept, leave feedback

### F6. Messaging
- [ ] Per-listing message thread
- [ ] Real-time updates (optional Supabase)
- [ ] Read receipts
- [ ] Unread count badge
- [ ] Message inbox page
- [ ] Typing indicators (optional)

**DoD**: Send message, receive message, mark as read

### F7. Moderation & Safety
- [ ] Report content (listing/user/message)
- [ ] Moderator dashboard with queue
- [ ] Freeze listing action
- [ ] Ban/unban user
- [ ] Audit log viewer
- [ ] Report resolution workflow
- [ ] Content review tools

**DoD**: Report listing, moderator freezes, audit log records action

### F8. Analytics & Admin
- [ ] Event tracking helper
- [ ] Track: signup, login, listing_created, offer_accepted, deal_complete
- [ ] Admin dashboard with KPI cards
- [ ] DAU/WAU/MAU metrics
- [ ] Listings/offers/deals counts
- [ ] Conversion funnel
- [ ] User growth chart
- [ ] Export data to CSV

**DoD**: Admin views analytics, events tracked, charts render

---

## G. API Specifications

### G1. Response Format

```typescript
// lib/api.ts
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>; // Validation errors
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Helper functions
export function success<T>(data: T, meta?: ApiSuccess<T>['meta']): Response {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data, meta });
}

export function error(code: string, message: string, status: number = 400): Response {
  return NextResponse.json<ApiError>(
    { success: false, error: { code, message } },
    { status }
  );
}
```

### G2. Error Codes

```typescript
export const ErrorCodes = {
  // Auth (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Authorization (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  AGE_GATE_REQUIRED: 'AGE_GATE_REQUIRED',
  RULES_ACCEPTANCE_REQUIRED: 'RULES_ACCEPTANCE_REQUIRED',
  
  // Validation (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resources (404)
  NOT_FOUND: 'NOT_FOUND',
  LISTING_NOT_FOUND: 'LISTING_NOT_FOUND',
  CIGAR_NOT_FOUND: 'CIGAR_NOT_FOUND',
  
  // Business Logic (422)
  LISTING_FROZEN: 'LISTING_FROZEN',
  OFFER_EXPIRED: 'OFFER_EXPIRED',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Rate Limiting (429)
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Server (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;
```

### G3. Key Endpoints

#### Search
```http
GET /api/search?q={query}&type={cigars|listings|all}&limit=20&offset=0
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cigars": [...],
    "listings": [...],
    "total": 45
  },
  "meta": {
    "query": "padron",
    "type": "all",
    "limit": 20,
    "offset": 0
  }
}
```

#### Cigars
```http
POST /api/cigars
Content-Type: application/json

{
  "lineId": "clx...",
  "vitola": "Robusto",
  "ringGauge": 50,
  "lengthMM": 127,
  "wrapper": "Maduro",
  "msrpCents": 1500
}
```

**Response**: `ApiResponse<Cigar>`

#### Listings
```http
GET /api/listings?type=WTS&region=US-CA&status=ACTIVE&minPrice=5000&maxPrice=50000

POST /api/listings
{
  "type": "WTS",
  "title": "Padron 1926 #9 - Box of 24",
  "description": "...",
  "cigarId": "clx...",
  "releaseId": "clx...",
  "qty": 24,
  "condition": "Mint",
  "priceCents": 48000,
  "region": "US-CA",
  "meetUpOnly": true
}

PATCH /api/listings/[id]
{
  "status": "ACTIVE",
  "priceCents": 45000
}
```

#### Offers
```http
POST /api/listings/[id]/offers
{
  "amountCents": 40000,
  "message": "Would you take $400?"
}

POST /api/offers/[id]/counter
{
  "amountCents": 43000,
  "message": "How about $430?"
}

POST /api/offers/[id]/accept
POST /api/offers/[id]/decline
POST /api/offers/[id]/withdraw
```

#### Messages
```http
GET /api/listings/[id]/messages
POST /api/listings/[id]/messages
{
  "body": "Is this still available?"
}

PATCH /api/messages/[id]/read
```

#### Moderation
```http
POST /api/reports
{
  "type": "LISTING",
  "listingId": "clx...",
  "reason": "Suspected counterfeit",
  "details": "..."
}

POST /api/mod/listings/[id]/freeze
{
  "reason": "Under investigation"
}

POST /api/mod/users/[id]/ban
{
  "reason": "Repeated violations",
  "duration": 30 // days, or null for permanent
}
```

---

## H. Performance & Caching

### H1. Next.js Caching Strategy

```typescript
// Static data (cigars, brands) - revalidate every hour
export const revalidate = 3600;

// Dynamic data (listings) - no cache
export const dynamic = 'force-dynamic';

// On-demand revalidation
import { revalidatePath } from 'next/cache';

export async function updateListing(id: string, data: UpdateListingDto) {
  await prisma.listing.update({ where: { id }, data });
  revalidatePath(`/marketplace/${id}`);
  revalidatePath('/marketplace');
}
```

### H2. Database Query Optimization

```typescript
// Use select to limit fields
const listings = await prisma.listing.findMany({
  select: {
    id: true,
    title: true,
    priceCents: true,
    photos: { take: 1 },
    user: { select: { displayName: true, reputation: true } },
  },
  take: 24,
});

// Use cursor-based pagination for infinite scroll
const listings = await prisma.listing.findMany({
  take: 24,
  skip: 1, // Skip cursor
  cursor: { id: lastId },
  orderBy: { publishedAt: 'desc' },
});

// Use transactions for consistency
await prisma.$transaction(async (tx) => {
  await tx.offer.update({ where: { id }, data: { status: 'ACCEPTED' } });
  await tx.listing.update({ where: { id: listingId }, data: { status: 'SOLD' } });
  await tx.auditLog.create({ data: { action: 'OFFER_ACCEPTED', ... } });
});
```

### H3. Client-Side Performance

```typescript
// Image optimization
import Image from 'next/image';

<Image
  src={photo.url}
  alt={photo.alt}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL={photo.blurDataURL}
  loading="lazy"
/>

// Code splitting
import dynamic from 'next/dynamic';

const OfferPanel = dynamic(() => import('@/components/features/marketplace/offer-panel'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-only if needed
});

// Debounced search
import { useDebouncedValue } from '@/hooks/use-debounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

### H4. Caching Layer (Optional - Redis)

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;
  
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// Usage
const stats = await getCached('admin:stats', async () => {
  return {
    totalUsers: await prisma.user.count(),
    activeListings: await prisma.listing.count({ where: { status: 'ACTIVE' } }),
    // ... more expensive queries
  };
}, 300); // Cache for 5 minutes
```

---

## I. Monitoring & Observability

### I1. Error Tracking (Sentry)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Don't send 404s
    if (event.exception?.values?.[0]?.type === 'NotFoundError') {
      return null;
    }
    return event;
  },
});

// Usage in API routes
try {
  // ... operation
} catch (error) {
  Sentry.captureException(error, {
    tags: { route: '/api/listings' },
    user: { id: session.user.id, email: session.user.email },
    extra: { listingId },
  });
  throw error;
}
```

### I2. Logging

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage
logger.info({ userId, listingId }, 'Listing created');
logger.error({ error, userId }, 'Failed to create listing');
```

### I3. Analytics Events

```typescript
// lib/analytics.ts
export const events = {
  user_signup: (userId: string) => track('user_signup', { userId }),
  listing_created: (userId: string, listingId: string, type: string) =>
    track('listing_created', { userId, listingId, type }),
  offer_accepted: (userId: string, offerId: string, amountCents: number) =>
    track('offer_accepted', { userId, offerId, amountCents }),
};

async function track(name: string, properties: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    await prisma.event.create({ data: { name, properties, userId: properties.userId } });
  }
  logger.info({ event: name, ...properties });
}
```

### I4. Performance Monitoring

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
  
  // Log slow requests
  const duration = Date.now() - start;
  if (duration > 2000) {
    logger.warn({ path: request.nextUrl.pathname, duration }, 'Slow request');
  }
  
  return response;
}
```

---

## J. Accessibility

### J1. WCAG 2.1 Level AA Requirements

#### Keyboard Navigation
- [ ] All interactive elements accessible via Tab
- [ ] Skip to main content link
- [ ] Focus trap in modals
- [ ] Escape key closes modals
- [ ] Arrow keys for navigation in lists/menus

#### ARIA Labels
```tsx
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

<input
  type="search"
  aria-label="Search cigars"
  aria-describedby="search-help"
/>
<p id="search-help">Search by brand, line, or vitola</p>
```

#### Focus Management
```typescript
// components/ui/dialog.tsx (Radix handles this)
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      {/* Focus trapped here */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

#### Color Contrast
```css
/* Ensure 4.5:1 ratio for normal text, 3:1 for large text */
:root {
  --foreground: 0 0% 10%;      /* #1a1a1a on white = 14.7:1 ✓ */
  --muted-foreground: 0 0% 45%; /* #737373 on white = 4.5:1 ✓ */
}
```

#### Alt Text
```tsx
<Image
  src={photo.url}
  alt={photo.alt || `Photo of ${cigar.line.brand.name} ${cigar.line.name} ${cigar.vitola}`}
  width={400}
  height={300}
/>
```

#### Form Errors
```tsx
<input
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert" className="text-destructive">
    {errors.email.message}
  </p>
)}
```

---

## K. Testing Strategy

### K1. Unit Tests (Vitest)

```typescript
// tests/unit/lib/valuation.test.ts
import { describe, it, expect } from 'vitest';
import { calculateIndexScore } from '@/lib/valuation';

describe('calculateIndexScore', () => {
  it('weights recent comps higher', () => {
    const comps = [
      { date: new Date('2024-01-15'), priceCents: 10000 }, // 15 days ago - 60% weight
      { date: new Date('2024-01-01'), priceCents: 8000 },  // 29 days ago - 30% weight
      { date: new Date('2023-12-01'), priceCents: 6000 },  // 60 days ago - 10% weight
    ];
    
    const score = calculateIndexScore(comps);
    expect(score).toBeCloseTo(9200); // (10000*0.6 + 8000*0.3 + 6000*0.1)
  });
  
  it('returns null with insufficient comps', () => {
    expect(calculateIndexScore([])).toBeNull();
    expect(calculateIndexScore([{ date: new Date(), priceCents: 5000 }])).toBeNull();
  });
});
```

### K2. Integration Tests (API Routes)

```typescript
// tests/integration/api/listings.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/listings/route';
import { prisma } from '@/lib/prisma';
import { mockSession } from '@/tests/helpers/auth';

describe('POST /api/listings', () => {
  beforeAll(async () => {
    await prisma.user.create({ data: { id: 'test-user', email: 'test@example.com' } });
  });
  
  afterAll(async () => {
    await prisma.user.delete({ where: { id: 'test-user' } });
  });
  
  it('creates a listing', async () => {
    mockSession({ user: { id: 'test-user' } });
    
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        type: 'WTS',
        title: 'Test Listing',
        description: 'Test description',
        qty: 1,
        priceCents: 5000,
      },
    });
    
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Test Listing');
  });
  
  it('validates required fields', async () => {
    mockSession({ user: { id: 'test-user' } });
    
    const { req } = createMocks({
      method: 'POST',
      body: { type: 'WTS' }, // Missing required fields
    });
    
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### K3. E2E Tests (Playwright)

```typescript
// tests/e2e/marketplace-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Marketplace Flow', () => {
  test('complete deal flow', async ({ page }) => {
    // 1. Sign in as buyer
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'buyer@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // 2. Browse marketplace
    await page.click('a[href="/marketplace"]');
    await expect(page).toHaveURL('/marketplace');
    
    // 3. View listing
    await page.click('.listing-card:first-child');
    await expect(page.locator('h1')).toContainText('Padron');
    
    // 4. Make offer
    await page.fill('[name="amountCents"]', '400');
    await page.fill('[name="message"]', 'Would you take $400?');
    await page.click('button:has-text("Send Offer")');
    await expect(page.locator('.offer-status')).toContainText('Sent');
    
    // 5. Sign in as seller (new context)
    const sellerPage = await page.context().newPage();
    await sellerPage.goto('/sign-in');
    await sellerPage.fill('[name="email"]', 'seller@example.com');
    await sellerPage.click('button[type="submit"]');
    
    // 6. View offer
    await sellerPage.goto('/inbox');
    await sellerPage.click('.offer-notification:first-child');
    await expect(sellerPage.locator('.offer-amount')).toContainText('$400');
    
    // 7. Counter offer
    await sellerPage.fill('[name="amountCents"]', '425');
    await sellerPage.click('button:has-text("Counter")');
    
    // 8. Accept counter (buyer)
    await page.reload();
    await expect(page.locator('.offer-amount')).toContainText('$425');
    await page.click('button:has-text("Accept")');
    
    // 9. Leave feedback
    await page.waitForSelector('.feedback-prompt');
    await page.click('[data-rating="5"]');
    await page.fill('[name="comment"]', 'Great seller!');
    await page.click('button:has-text("Submit Feedback")');
    
    await expect(page.locator('.success-message')).toContainText('Feedback submitted');
  });
});
```

### K4. Test Coverage Goals

- **Unit tests**: 80% coverage for `/lib`
- **Integration tests**: All API routes
- **E2E tests**: Critical user journeys (auth, marketplace, admin)
- **CI**: Run on every PR

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm prisma migrate deploy
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm playwright install --with-deps
      - run: pnpm test:e2e
```

---

## L. Deployment

### L1. Environment Variables

```bash
# .env.production
NODE_ENV=production
NEXTAUTH_URL=https://humidor.club
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

DATABASE_URL=postgresql://user:pass@db.region.provider.com:5432/humidor_prod

RESEND_API_KEY=re_...
EMAIL_FROM="Humidor Club <no-reply@humidor.club>"

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

CRON_SECRET=<random string for webhook auth>
```

### L2. Database Setup

```bash
# 1. Create database (Supabase/Neon)
# 2. Enable extensions
psql $DATABASE_URL -c "create extension if not exists pg_trgm;"
psql $DATABASE_URL -c "create extension if not exists unaccent;"

# 3. Run migrations
pnpm prisma migrate deploy

# 4. Seed (optional)
pnpm prisma db seed
```

### L3. Vercel Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... repeat for all env vars
```

### L4. Cron Jobs (Vercel)

```typescript
// app/api/cron/index-calculation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateIndexScore } from '@/lib/valuation';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get all releases with 3+ comps
  const releases = await prisma.release.findMany({
    where: {
      comps: {
        some: {},
      },
    },
    include: {
      comps: {
        where: {
          date: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });
  
  let updated = 0;
  
  for (const release of releases) {
    const indexScore = calculateIndexScore(release.comps);
    if (indexScore !== null) {
      await prisma.release.update({
        where: { id: release.id },
        data: {
          indexScore,
          lastIndexCalc: new Date(),
        },
      });
      updated++;
    }
  }
  
  return NextResponse.json({ success: true, updated });
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/index-calculation",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### L5. Pre-Deploy Checklist

- [ ] Run `pnpm build` locally - no errors
- [ ] Run `pnpm test` - all tests pass
- [ ] Check TypeScript: `pnpm tsc --noEmit`
- [ ] Check ESLint: `pnpm lint`
- [ ] Run Lighthouse audit (>90 performance, accessibility)
- [ ] Test magic link emails in production email service
- [ ] Verify all env vars set in Vercel
- [ ] Run migrations on production DB
- [ ] Test on staging environment
- [ ] Set up Sentry error tracking
- [ ] Configure domain and SSL

### L6. Post-Deploy Checklist

- [ ] Smoke test critical paths:
  - [ ] Sign in via magic link
  - [ ] Complete age/rules gating
  - [ ] Create listing
  - [ ] Send offer
  - [ ] Upload image
- [ ] Check Vercel function logs
- [ ] Monitor Sentry for errors (first hour)
- [ ] Verify database connection pool stable
- [ ] Test from different browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design on mobile
- [ ] Check email deliverability

### L7. Rollback Plan

**If deployment fails**:
1. Instant rollback in Vercel UI (Deployments → Previous → Promote)
2. Revert database migrations: `pnpm prisma migrate resolve --rolled-back MIGRATION_NAME`
3. Keep database backup before any migration

**Monitoring**:
- Set up Sentry alerts for error rate > 5%
- Set up Vercel alerts for function timeout/errors
- Monitor database CPU/memory usage

---

## M. Milestones

### M1. Day-by-Day Plan (12 workdays)

#### **Day 1**: Foundation
- [x] Initialize Next.js project
- [x] Install dependencies (Tailwind, Shadcn, Prisma, NextAuth)
- [x] Configure TypeScript, ESLint, Prettier
- [x] Create Prisma schema
- [x] Run initial migration
- [x] Set up environment variables

#### **Day 2**: Auth & Gating
- [ ] Implement NextAuth with Email provider
- [ ] Create sign-in page
- [ ] Age attestation modal
- [ ] Rules acceptance modal
- [ ] Protected route middleware
- [ ] Seed script v1 (test user)

#### **Day 3**: UI Shell & Layout
- [ ] Install/configure Shadcn components
- [ ] Create sidebar + topbar layout
- [ ] Dashboard page
- [ ] User profile page
- [ ] Navigation guards

#### **Day 4**: Cigar Knowledge Base (Part 1)
- [ ] Brand/Line/Cigar CRUD APIs
- [ ] Cigar form with inline brand/line creation
- [ ] Cigar detail page
- [ ] Photo upload implementation
- [ ] Search API v1

#### **Day 5**: Cigar Knowledge Base (Part 2)
- [ ] Tasting notes form + display
- [ ] Pairing ratings form + aggregates
- [ ] Cigar search with filters
- [ ] Browse cigars page
- [ ] Seed script v2 (cigars + notes)

#### **Day 6**: Humidor & Collectibles
- [ ] Humidor CRUD APIs
- [ ] Humidor page with table
- [ ] Add item form
- [ ] Comps entry UI
- [ ] Release detail page

#### **Day 7**: Valuation Index
- [ ] Index calculation logic
- [ ] Cron job API route
- [ ] Index display with deltas
- [ ] Historical chart (optional simple version)
- [ ] Confidence indicator

#### **Day 8**: Marketplace (Part 1)
- [ ] Listing CRUD APIs
- [ ] Listing form with stepper
- [ ] Listings grid page
- [ ] Listing filters
- [ ] Listing detail page

#### **Day 9**: Marketplace (Part 2)
- [ ] Offers API (create/counter/accept/decline)
- [ ] Offer panel component
- [ ] Offer history timeline
- [ ] Notifications (basic)

#### **Day 10**: Messaging & Feedback
- [ ] Messages API
- [ ] Message thread component
- [ ] Inbox page
- [ ] Deal completion flow
- [ ] Feedback form + display

#### **Day 11**: Moderation & Admin
- [ ] Reports API
- [ ] Moderator dashboard
- [ ] Freeze/ban actions
- [ ] Audit log viewer
- [ ] Admin analytics page
- [ ] Invite code system

#### **Day 12**: Testing & Polish
- [ ] E2E tests (Playwright)
- [ ] Fix linter errors
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deploy to production

---

## N. Definition of Done (MVP)

### Feature Completeness
- [x] Age-gated, invite-only authentication
- [ ] Email magic link sign-in working
- [ ] User can create/edit profile
- [ ] User can add cigars with photos
- [ ] User can write tasting notes and pairing ratings
- [ ] Search returns relevant cigars
- [ ] User can add items to humidor
- [ ] User can enter comps for releases
- [ ] Index calculation runs and displays correctly
- [ ] User can create marketplace listings (WTS/WTB/WTT)
- [ ] User can make/counter/accept/decline offers
- [ ] Per-listing messaging works
- [ ] Deal can be marked complete
- [ ] Post-deal feedback saved and displayed
- [ ] Moderators can freeze listings and ban users
- [ ] Audit log records all moderation actions
- [ ] Admin can view analytics dashboard

### Technical Quality
- [ ] All TypeScript errors resolved
- [ ] No ESLint errors
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E tests covering critical flows
- [ ] Lighthouse score >90 for performance and accessibility
- [ ] Responsive design works on mobile
- [ ] Error tracking set up (Sentry)
- [ ] Rate limiting implemented
- [ ] CSRF protection enabled
- [ ] Input validation on all forms
- [ ] Images compressed and optimized

### Security & Compliance
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Prisma queries use parameterized inputs
- [ ] File uploads validated (type, size, EXIF stripped)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent (if using analytics)
- [ ] GDPR data export endpoint
- [ ] GDPR data deletion endpoint

### Documentation
- [ ] README with setup instructions
- [ ] API documentation
- [ ] Component architecture guide
- [ ] Deployment runbook
- [ ] Contributing guidelines

---

## O. Cursor Vibe-Coding Prompts

Use these prompts to implement features step-by-step in Cursor:

### 1. Auth Setup
```
Implement NextAuth v5 with Email provider using Resend. Create lib/auth.ts with NextAuth config, app/api/auth/[...nextauth]/route.ts, and sign-in page at app/(auth)/sign-in/page.tsx. Use Prisma adapter with the User model. Include age and rules acceptance checks in callbacks.
```

### 2. Protected Layout
```
Create a protected layout at app/(protected)/layout.tsx that checks for session using getServerSession. If user hasn't confirmed age or accepted rules, redirect to onboarding pages. Add sidebar and topbar components using Shadcn.
```

### 3. Cigar Form
```
Build a CigarForm component with inline brand/line creation. When user types a brand name, show autocomplete from existing brands or allow creating new. Same for lines. Include fields: vitola, ring gauge, length, wrapper/binder/filler, MSRP. Use Zod for validation and server actions for submission.
```

### 4. Search Implementation
```
Create GET /api/search endpoint that accepts query, type (cigars/listings/all), and pagination params. Use Postgres full-text search with pg_trgm for fuzzy matching on brands and lines. Return unified results with highlighting.
```

### 5. Marketplace Listing Form
```
Build a multi-step listing form: (1) Select cigar/release, (2) Enter details (qty, condition, price), (3) Upload photos (max 8), (4) Review and publish. Use Shadcn Stepper or tabs. Submit to POST /api/listings.
```

### 6. Offer Workflow
```
On listing detail page, add OfferPanel component. Implement POST /api/listings/[id]/offers to create offer, POST /api/offers/[id]/counter for counter-offers, POST /api/offers/[id]/accept to accept. Show offer history timeline with status badges.
```

### 7. Messaging Thread
```
Create MessageThread component for per-listing chat. Fetch messages from GET /api/listings/[id]/messages. Add form to send message (POST). Optional: integrate Supabase Realtime for live updates. Show read receipts and typing indicators.
```

### 8. Index Calculation
```
Implement calculateIndexScore function in lib/valuation.ts. Take array of Comps, filter to last 90 days, apply 60/30/10 weighting based on age. Return null if < 3 comps. Create cron API route at app/api/cron/index-calculation/route.ts to run nightly.
```

### 9. Moderation Dashboard
```
Create admin/reports/page.tsx with table of pending reports. For each report, show actions: View Details, Freeze Listing, Ban User, Dismiss. Implement POST /api/mod/listings/[id]/freeze and POST /api/mod/users/[id]/ban. Log all actions to AuditLog.
```

### 10. Analytics Dashboard
```
Create admin/page.tsx with KPI cards: Total Users, Active Listings, Offers This Week, Deal Completion Rate, Average Deal Time. Use Prisma aggregations. Add simple charts using Recharts or Chart.js. Cache results for 5 minutes.
```

### 11. E2E Test Suite
```
Write Playwright E2E test that: (1) Signs in as user, (2) Completes age/rules, (3) Creates a cigar, (4) Adds tasting note, (5) Creates WTS listing, (6) Signs in as second user, (7) Makes offer, (8) First user accepts, (9) Both leave feedback. Assert success states.
```

### 12. Deployment Prep
```
Create deployment checklist. Run pnpm build and fix any errors. Configure Vercel project with environment variables. Set up Supabase storage bucket with CORS. Deploy database migrations with prisma migrate deploy. Test magic link emails in production. Set up Sentry error tracking.
```

---

## P. Troubleshooting Guide

### P1. Common Issues

#### Magic Link Not Received
- Check spam folder
- Verify Resend API key is correct
- Check Resend dashboard for delivery status
- Test with different email provider (Gmail, ProtonMail)
- In development, use `mailhog` or `ethereal.email`

#### Prisma Relation Errors
```bash
# Run format to fix syntax
npx prisma format

# Regenerate client
npx prisma generate

# Reset database if needed (DEV ONLY)
npx prisma migrate reset
```

#### Image Upload Fails
- Verify Supabase bucket CORS settings:
```json
{
  "allowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["*"],
  "maxAgeSeconds": 3600
}
```
- Check bucket public read policy
- Verify file size < 5MB
- Check MIME type validation

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript
pnpm tsc --noEmit

# Check for missing dependencies
pnpm install <missing-package>
```

#### Session Not Persisting
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear cookies and try again
- Check browser console for errors

### P2. Performance Issues

#### Slow Queries
```bash
# Enable Prisma query logging
DEBUG=prisma:query pnpm dev

# Add missing indexes
npx prisma studio
# Check query execution time in logs
```

#### High Memory Usage
- Reduce Prisma connection pool: `connection_limit=10` in DATABASE_URL
- Use `select` to limit fields returned
- Implement cursor pagination instead of offset
- Add Redis caching for expensive queries

#### Slow Image Loads
- Verify images are WebP format
- Check CDN caching headers
- Use Next.js Image component with `loading="lazy"`
- Implement blur placeholders

---

## Q. Post-MVP Roadmap

### Phase 2: Enhanced Features
- [ ] Mobile app (React Native/Expo)
- [ ] Push notifications
- [ ] Advanced search filters (flavor profiles, price history)
- [ ] Watchlists and price alerts
- [ ] Social features (follow users, activity feed)
- [ ] Events calendar + RSVPs
- [ ] Verified seller badges with ID verification

### Phase 3: Marketplace Enhancement
- [ ] Escrow for accessories (non-tobacco)
- [ ] Shipping integration (labels, tracking)
- [ ] In-person meetup coordination
- [ ] Dispute resolution system
- [ ] Seller protection features

### Phase 4: Advanced Analytics
- [ ] Market trends and insights
- [ ] Predictive pricing
- [ ] Collection valuation reports
- [ ] Export portfolio to PDF
- [ ] Tax reporting tools

### Phase 5: Community
- [ ] Forums/discussion boards
- [ ] Blog/articles
- [ ] User-generated content (reviews, guides)
- [ ] Community voting on cigars
- [ ] Collaboration features

---

## R. Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Shadcn UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)

### Tools
- [Excalidraw](https://excalidraw.com) - Wireframing
- [Figma](https://figma.com) - Design
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Prisma Studio](https://www.prisma.io/studio)
- [Vercel Dashboard](https://vercel.com/dashboard)

### Learning
- [Next.js Learn](https://nextjs.org/learn)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023)

---

## S. Legal & Policies (Templates)

### Age Gate Copy
```
Welcome to Humidor Club

By entering, you confirm that you are:
- 21 years of age or older
- Legally permitted to possess tobacco in your jurisdiction

By clicking "I Confirm," you agree to our Terms of Service and Community Guidelines.

[I Confirm] [Exit]
```

### Marketplace Disclaimer
```
IMPORTANT NOTICE

Humidor Club is a private community platform for cigar enthusiasts to connect 
and negotiate private transactions. 

We do NOT:
- Process payments
- Handle shipping
- Verify authenticity
- Provide buyer/seller protection

Members are solely responsible for:
- Verifying item authenticity
- Negotiating terms
- Arranging payment and delivery
- Complying with local laws and regulations

All transactions are at your own risk.
```

### Counterfeit Policy
```
Zero Tolerance for Counterfeits

All listings must be accurate and truthful. You must:
- Provide clear, unedited photos
- Disclose provenance when known
- Accurately describe condition
- Not misrepresent items

Suspected counterfeits will be:
1. Immediately frozen
2. Investigated by moderators
3. Reported if confirmed

Penalties:
- First offense: Listing removed, warning
- Second offense: 30-day suspension
- Third offense: Permanent ban

Report suspected counterfeits to moderators@humidor.club
```

---

## T. Success Metrics (KPIs)

### User Engagement
- **DAU/MAU Ratio**: Target >20% (sticky product)
- **Session Duration**: Target >5 minutes
- **Pages per Session**: Target >3
- **Return Rate**: Target >60% within 7 days

### Marketplace Health
- **Listing Completion Rate**: Target >40%
- **Offer Response Rate**: Target >70%
- **Average Time to Deal**: Target <7 days
- **Repeat Transactions**: Target >30%

### Community Quality
- **Report Rate**: Target <2% of listings
- **Moderator Response Time**: Target <24 hours
- **User Reputation Score**: Median >4.0/5.0
- **Churn Rate**: Target <10% monthly

### Growth
- **Monthly Active Users**: Growth target +20% MoM
- **New Listings**: Growth target +15% MoM
- **Network Effects**: New users invited by existing >30%

---

**You're ready to build a production-grade cigar club platform. Start with Day 1 and work through systematically. Good luck! 🚀**

