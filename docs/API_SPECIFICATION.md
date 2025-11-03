# Humidor Club - API Specification

Complete API reference for all endpoints with request/response schemas, authentication, and error handling.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Codes](#error-codes)
4. [Rate Limiting](#rate-limiting)
5. [Pagination](#pagination)
6. [Endpoints](#endpoints)

---

## Authentication

All protected endpoints require a valid session. Sessions are managed by NextAuth.js.

### Headers

```http
Cookie: next-auth.session-token=<token>
```

### Authorization Levels

```typescript
enum Role {
  MEMBER = 0,        // Can view, create listings, make offers
  TRUSTED_SELLER = 10, // Enhanced reputation, badge
  MODERATOR = 50,    // Can freeze listings, view reports
  ADMIN = 100        // Full access to all features
}
```

---

## Response Format

All API responses follow a consistent structure:

### Success Response

```typescript
{
  success: true,
  data: T,
  meta?: {
    page?: number,
    limit?: number,
    total?: number,
    hasMore?: boolean
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: Record<string, string[]> // Validation errors
  }
}
```

### Example Success

```json
{
  "success": true,
  "data": {
    "id": "clx123",
    "title": "Padron 1926 #9",
    "priceCents": 48000
  }
}
```

### Example Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "priceCents": ["Must be a positive number"],
      "qty": ["Must be at least 1"]
    }
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | No valid session |
| `SESSION_EXPIRED` | 401 | Session has expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `AGE_GATE_REQUIRED` | 403 | Age confirmation needed |
| `RULES_ACCEPTANCE_REQUIRED` | 403 | Rules acceptance needed |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `NOT_FOUND` | 404 | Resource not found |
| `LISTING_FROZEN` | 422 | Listing is frozen by moderator |
| `OFFER_EXPIRED` | 422 | Offer is no longer valid |
| `ALREADY_EXISTS` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

Rate limits are applied per user and per IP address.

| Endpoint Category | Rate Limit |
|------------------|------------|
| Auth | 5 requests / 15 minutes |
| Search | 20 requests / minute |
| Image Upload | 10 uploads / hour |
| API (general) | 100 requests / minute |

Rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

When rate limited:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later."
  }
}
```

---

## Pagination

Use cursor-based pagination for large datasets.

### Request

```http
GET /api/listings?limit=24&cursor=clx123
```

### Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "limit": 24,
    "hasMore": true,
    "nextCursor": "clx456"
  }
}
```

---

## Endpoints

### Search

#### `GET /api/search`

Search across cigars and listings.

**Query Parameters:**

```typescript
{
  q: string;           // Search query
  type?: 'cigars' | 'listings' | 'all'; // Default: 'all'
  limit?: number;      // Default: 20, max: 100
  offset?: number;     // Default: 0
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    cigars: Cigar[];
    listings: Listing[];
    total: number;
  };
  meta: {
    query: string;
    type: string;
    limit: number;
    offset: number;
  };
}
```

**Example:**

```bash
curl -X GET "https://api.humidor.club/api/search?q=padron&type=cigars&limit=10"
```

---

### Cigars

#### `GET /api/cigars`

List cigars with optional filters.

**Query Parameters:**

```typescript
{
  brandId?: string;
  lineId?: string;
  country?: string;
  vitola?: string;
  minPrice?: number;   // In cents
  maxPrice?: number;   // In cents
  limit?: number;      // Default: 24
  cursor?: string;     // For pagination
}
```

**Response:**

```typescript
{
  success: true;
  data: Cigar[];
  meta: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

---

#### `POST /api/cigars`

Create a new cigar.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  lineId: string;
  vitola: string;
  factory?: string;
  country?: string;
  ringGauge?: number;
  lengthMM?: number;
  wrapper?: string;
  binder?: string;
  filler?: string;
  msrpCents?: number;
  typicalStreetCents?: number;
  strength?: 'Mild' | 'Medium' | 'Full';
  body?: 'Light' | 'Medium' | 'Full';
}
```

**Response:**

```typescript
{
  success: true;
  data: Cigar;
}
```

**Example:**

```bash
curl -X POST "https://api.humidor.club/api/cigars" \
  -H "Content-Type: application/json" \
  -d '{
    "lineId": "clx123",
    "vitola": "Robusto",
    "ringGauge": 50,
    "lengthMM": 127,
    "wrapper": "Maduro",
    "msrpCents": 1500
  }'
```

---

#### `GET /api/cigars/[id]`

Get cigar details.

**Response:**

```typescript
{
  success: true;
  data: Cigar & {
    line: Line & {
      brand: Brand;
    };
    photos: Photo[];
    releases: Release[];
  };
}
```

---

#### `PATCH /api/cigars/[id]`

Update cigar.

**Authorization:** MEMBER+ (own submissions) or ADMIN

**Request Body:** Partial cigar object

**Response:**

```typescript
{
  success: true;
  data: Cigar;
}
```

---

#### `POST /api/cigars/[id]/notes`

Add tasting note.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  rating?: number;        // 1-5
  aroma?: string;
  draw?: 'Tight' | 'Perfect' | 'Loose';
  burn?: 'Uneven' | 'Good' | 'Perfect';
  strength?: 'Mild' | 'Medium' | 'Full';
  body?: 'Light' | 'Medium' | 'Full';
  flavor?: string;        // Rich text
  notes?: string;         // Rich text
}
```

**Response:**

```typescript
{
  success: true;
  data: TastingNote;
}
```

---

#### `GET /api/cigars/[id]/notes`

Get tasting notes for a cigar.

**Query Parameters:**

```typescript
{
  limit?: number;     // Default: 10
  cursor?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: (TastingNote & { user: User })[];
  meta: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

---

#### `POST /api/cigars/[id]/pairings`

Add pairing rating.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  beverage: string;
  score: number;        // 1-5
  note?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: PairingRating;
}
```

---

#### `GET /api/cigars/[id]/pairings`

Get pairing aggregates for a cigar.

**Response:**

```typescript
{
  success: true;
  data: PairingAggregate[];
}
```

---

### Brands & Lines

#### `GET /api/brands`

List all brands.

**Response:**

```typescript
{
  success: true;
  data: Brand[];
}
```

---

#### `POST /api/brands`

Create brand.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  name: string;
  description?: string;
  country?: string;
  founded?: number;
  website?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: Brand;
}
```

---

#### `POST /api/brands/[id]/lines`

Create line under a brand.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  name: string;
  description?: string;
  releaseYear?: number;
}
```

**Response:**

```typescript
{
  success: true;
  data: Line;
}
```

---

### Releases

#### `GET /api/releases/[id]`

Get release details including valuation index.

**Response:**

```typescript
{
  success: true;
  data: Release & {
    cigar: Cigar & {
      line: Line & { brand: Brand };
    };
    comps: Comp[];
    _count: {
      comps: number;
    };
  };
}
```

---

#### `POST /api/releases/[id]/comps`

Add comp (comparable sale).

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  source: string;           // "eBay", "Auction", etc.
  date: string;             // ISO date
  qty: number;
  condition?: string;
  priceCents: number;
  currency?: string;        // Default: USD
  region?: string;
  url?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: Comp;
}
```

---

#### `GET /api/releases/[id]/index`

Get valuation index with historical data.

**Response:**

```typescript
{
  success: true;
  data: {
    indexScore: number | null;
    indexDelta7d: number | null;
    indexDelta30d: number | null;
    indexDelta90d: number | null;
    compsCount: number;
    lastCalculated: string | null; // ISO date
    confidence: 'Low' | 'Medium' | 'High';
  };
}
```

---

### Humidor

#### `GET /api/humidor`

Get current user's humidor items.

**Authorization:** MEMBER+

**Response:**

```typescript
{
  success: true;
  data: (HumidorItem & {
    release?: Release & {
      cigar: Cigar & {
        line: Line & { brand: Brand };
      };
    };
  })[];
}
```

---

#### `POST /api/humidor`

Add item to humidor.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  cigarId: string;
  releaseId?: string;
  qty: number;
  isCollectible?: boolean;
  condition?: string;
  provenance?: string;
  storage?: string;
  acquiredAt?: string;      // ISO date
  acquiredCents?: number;
}
```

**Response:**

```typescript
{
  success: true;
  data: HumidorItem;
}
```

---

#### `PATCH /api/humidor/[id]`

Update humidor item.

**Authorization:** MEMBER+ (own items only)

**Request Body:** Partial humidor item

**Response:**

```typescript
{
  success: true;
  data: HumidorItem;
}
```

---

#### `DELETE /api/humidor/[id]`

Remove item from humidor.

**Authorization:** MEMBER+ (own items only)

**Response:**

```typescript
{
  success: true;
  data: { id: string };
}
```

---

### Listings

#### `GET /api/listings`

Browse marketplace listings with filters.

**Query Parameters:**

```typescript
{
  type?: 'WTS' | 'WTB' | 'WTT';
  status?: 'ACTIVE' | 'SOLD' | 'WITHDRAWN';
  region?: string;
  minPrice?: number;        // In cents
  maxPrice?: number;        // In cents
  condition?: string;
  userId?: string;          // Filter by seller
  limit?: number;           // Default: 24
  cursor?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: (Listing & {
    user: User;
    photos: Photo[];
    release?: Release;
    _count: {
      offers: number;
    };
  })[];
  meta: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

---

#### `POST /api/listings`

Create listing.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  type: 'WTS' | 'WTB' | 'WTT';
  title: string;
  description: string;
  cigarId?: string;
  releaseId?: string;
  qty: number;
  condition?: string;
  priceCents?: number;
  currency?: string;        // Default: USD
  region?: string;
  city?: string;
  meetUpOnly?: boolean;     // Default: true
  willShip?: boolean;       // Default: false
  status?: 'DRAFT' | 'ACTIVE'; // Default: DRAFT
}
```

**Response:**

```typescript
{
  success: true;
  data: Listing;
}
```

---

#### `GET /api/listings/[id]`

Get listing details.

**Response:**

```typescript
{
  success: true;
  data: Listing & {
    user: User;
    photos: Photo[];
    release?: Release & {
      cigar: Cigar & {
        line: Line & { brand: Brand };
      };
      indexScore?: number;
    };
    offers: (Offer & {
      fromUser: User;
    })[];
  };
}
```

---

#### `PATCH /api/listings/[id]`

Update listing.

**Authorization:** MEMBER+ (own listings) or ADMIN

**Request Body:** Partial listing object

**Response:**

```typescript
{
  success: true;
  data: Listing;
}
```

---

#### `DELETE /api/listings/[id]`

Delete listing.

**Authorization:** MEMBER+ (own listings) or ADMIN

**Response:**

```typescript
{
  success: true;
  data: { id: string };
}
```

---

### Offers

#### `POST /api/listings/[id]/offers`

Make an offer on a listing.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  amountCents?: number;     // Optional for WTT
  message?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: Offer;
}
```

---

#### `GET /api/offers`

Get offers (sent or received).

**Authorization:** MEMBER+

**Query Parameters:**

```typescript
{
  direction?: 'sent' | 'received'; // Default: both
  status?: 'OPEN' | 'COUNTERED' | 'ACCEPTED' | 'DECLINED';
  limit?: number;
  cursor?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: (Offer & {
    listing: Listing;
    fromUser: User;
  })[];
  meta: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

---

#### `POST /api/offers/[id]/counter`

Counter an offer.

**Authorization:** MEMBER+ (listing owner only)

**Request Body:**

```typescript
{
  amountCents?: number;
  message?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: Offer;  // The new counter-offer
}
```

---

#### `POST /api/offers/[id]/accept`

Accept an offer.

**Authorization:** MEMBER+ (listing owner only)

**Response:**

```typescript
{
  success: true;
  data: {
    offer: Offer;
    listing: Listing;  // Status updated to SOLD
  };
}
```

---

#### `POST /api/offers/[id]/decline`

Decline an offer.

**Authorization:** MEMBER+ (listing owner only)

**Request Body:**

```typescript
{
  message?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: Offer;
}
```

---

#### `POST /api/offers/[id]/withdraw`

Withdraw your offer.

**Authorization:** MEMBER+ (offer sender only)

**Response:**

```typescript
{
  success: true;
  data: Offer;
}
```

---

### Messages

#### `GET /api/listings/[id]/messages`

Get messages for a listing.

**Authorization:** MEMBER+ (buyer or seller only)

**Response:**

```typescript
{
  success: true;
  data: (Message & {
    fromUser: User;
    toUser: User;
  })[];
}
```

---

#### `POST /api/listings/[id]/messages`

Send message.

**Authorization:** MEMBER+ (buyer or seller only)

**Request Body:**

```typescript
{
  body: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: Message;
}
```

---

#### `PATCH /api/messages/[id]/read`

Mark message as read.

**Authorization:** MEMBER+ (recipient only)

**Response:**

```typescript
{
  success: true;
  data: Message;
}
```

---

### Feedback

#### `POST /api/feedback`

Leave feedback after deal.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  forUserId: string;
  listingId: string;
  rating: number;               // 1-5
  comment?: string;
  communication?: boolean;      // Good/bad
  packaging?: boolean;
  accuracy?: boolean;           // Item as described
}
```

**Response:**

```typescript
{
  success: true;
  data: DealFeedback;
}
```

---

#### `GET /api/users/[id]/feedback`

Get feedback for a user.

**Query Parameters:**

```typescript
{
  limit?: number;
  cursor?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: (DealFeedback & {
    byUser: User;
  })[];
  meta: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
    averageRating: number;
    totalCount: number;
  };
}
```

---

### Reports

#### `POST /api/reports`

Report content.

**Authorization:** MEMBER+

**Request Body:**

```typescript
{
  type: 'LISTING' | 'USER' | 'MESSAGE';
  listingId?: string;
  reason: string;
  details?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: Report;
}
```

---

#### `GET /api/reports`

Get reports (moderator only).

**Authorization:** MODERATOR+

**Query Parameters:**

```typescript
{
  status?: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  type?: 'LISTING' | 'USER' | 'MESSAGE';
  limit?: number;
  cursor?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: (Report & {
    reportedBy: User;
    listing?: Listing;
  })[];
  meta: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

---

#### `PATCH /api/reports/[id]`

Update report status.

**Authorization:** MODERATOR+

**Request Body:**

```typescript
{
  status: 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  resolution?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: Report;
}
```

---

### Moderation

#### `POST /api/mod/listings/[id]/freeze`

Freeze listing.

**Authorization:** MODERATOR+

**Request Body:**

```typescript
{
  reason: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    listing: Listing;
    auditLog: AuditLog;
  };
}
```

---

#### `POST /api/mod/listings/[id]/unfreeze`

Unfreeze listing.

**Authorization:** MODERATOR+

**Response:**

```typescript
{
  success: true;
  data: Listing;
}
```

---

#### `POST /api/mod/users/[id]/ban`

Ban user.

**Authorization:** ADMIN

**Request Body:**

```typescript
{
  reason: string;
  duration?: number;  // Days, null for permanent
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    user: User;
    auditLog: AuditLog;
  };
}
```

---

#### `POST /api/mod/users/[id]/unban`

Unban user.

**Authorization:** ADMIN

**Response:**

```typescript
{
  success: true;
  data: User;
}
```

---

### Admin

#### `GET /api/admin/stats`

Get platform statistics.

**Authorization:** ADMIN

**Response:**

```typescript
{
  success: true;
  data: {
    users: {
      total: number;
      active: number;         // Last 30 days
      new: number;            // Last 7 days
    };
    listings: {
      total: number;
      active: number;
      sold: number;
      frozen: number;
    };
    offers: {
      total: number;
      open: number;
      accepted: number;
    };
    deals: {
      completed: number;
      completionRate: number;  // Percentage
      avgTimeToComplete: number; // Days
    };
  };
}
```

---

#### `GET /api/admin/users`

List users with filters.

**Authorization:** ADMIN

**Query Parameters:**

```typescript
{
  role?: 'MEMBER' | 'TRUSTED_SELLER' | 'MODERATOR' | 'ADMIN';
  search?: string;
  limit?: number;
  cursor?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: User[];
  meta: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

---

#### `POST /api/admin/invites`

Generate invite code.

**Authorization:** ADMIN

**Request Body:**

```typescript
{
  maxUses?: number;      // Default: 1
  expiresAt?: string;    // ISO date, optional
}
```

**Response:**

```typescript
{
  success: true;
  data: InviteCode;
}
```

---

### Upload

#### `POST /api/upload`

Upload image.

**Authorization:** MEMBER+

**Request:** `multipart/form-data`

```typescript
{
  file: File;            // Max 5MB, jpg/png/webp
  type: 'listing' | 'cigar' | 'profile';
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    url: string;
    key: string;
    width: number;
    height: number;
    size: number;
  };
}
```

---

### Webhooks (Cron)

#### `GET /api/cron/index-calculation`

Calculate valuation indexes for all releases.

**Authorization:** Bearer token (CRON_SECRET)

**Headers:**

```http
Authorization: Bearer <CRON_SECRET>
```

**Response:**

```typescript
{
  success: true;
  data: {
    processed: number;
    updated: number;
    errors: number;
  };
}
```

---

## Webhooks (Events)

For future implementation, webhook events could be sent to external services:

```typescript
enum WebhookEvent {
  'user.created',
  'listing.created',
  'listing.sold',
  'offer.accepted',
  'deal.completed',
  'report.created',
}

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { HumidorClient } from '@humidor-club/sdk';

const client = new HumidorClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.humidor.club',
});

// Search cigars
const results = await client.search.query({
  q: 'padron',
  type: 'cigars',
});

// Create listing
const listing = await client.listings.create({
  type: 'WTS',
  title: 'Padron 1926 #9',
  priceCents: 48000,
  qty: 24,
});

// Make offer
const offer = await client.offers.create(listing.id, {
  amountCents: 40000,
  message: 'Would you take $400?',
});
```

---

## Changelog

### v1.0.0 (MVP)
- Initial API release
- All core endpoints implemented
- Rate limiting enabled
- Documentation complete

---

**For support or questions, contact:** api@humidor.club

