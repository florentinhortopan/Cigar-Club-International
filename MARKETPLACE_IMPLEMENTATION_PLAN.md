# Marketplace Implementation Plan

## Overview
This document outlines the implementation plan for activating the marketplace feature, allowing users to flag cigars in their humidor as available for sale or trade, set quantities, and create listings.

## Schema Changes ✅

### 1. Listing Model (Added)
- **Type**: Enum (WTS, WTB, WTT)
- **Status**: Enum (DRAFT, ACTIVE, PENDING, SOLD, WITHDRAWN, FROZEN)
- **Fields**:
  - Basic: title, description, qty, condition
  - Pricing: price_cents, currency
  - Location: region, city, meet_up_only, will_ship
  - References: cigar_id (optional), humidor_item_id (optional)
  - Status: status, published_at, sold_at, frozen_at
  - Media: image_urls (JSON array)
  - Metrics: view_count

### 2. HumidorItem Updates (Added)
- **available_for_sale**: Int (default 0) - Quantity available for sale
- **available_for_trade**: Int (default 0) - Quantity available for trade
- Added indexes for marketplace queries

## Implementation Steps

### Phase 1: Database Setup
- [x] Add Listing model to Prisma schema
- [x] Update HumidorItem model with marketplace fields
- [ ] Create and run database migration
- [ ] Update Prisma client

### Phase 2: API Routes
- [ ] Create `/api/listings` route (GET, POST)
  - GET: Browse listings with filters (type, status, region, price range)
  - POST: Create new listing from humidor item or manually
- [ ] Create `/api/listings/[id]` route (GET, PATCH, DELETE)
  - GET: Get listing details
  - PATCH: Update listing (status, price, quantity, etc.)
  - DELETE: Remove listing
- [ ] Create `/api/humidor/[id]/marketplace` route (PATCH)
  - Update available_for_sale and available_for_trade quantities

### Phase 3: Humidor Page Updates
- [ ] Add "Mark for Sale/Trade" UI to each humidor item card
- [ ] Add quantity input for available_for_sale
- [ ] Add quantity input for available_for_trade
- [ ] Add "Create Listing" button that links to listing creation page
- [ ] Show indicators for items marked as available

### Phase 4: Listing Creation
- [ ] Create `/marketplace/new` page
- [ ] Form to create listing:
  - Select from humidor items (pre-populated if coming from humidor)
  - Or create listing manually (search for cigar)
  - Type selection (WTS, WTB, WTT)
  - Title, description
  - Quantity (validated against available quantity)
  - Price (required for WTS, optional for WTT)
  - Condition
  - Location (region, city)
  - Shipping options (meet_up_only, will_ship)
  - Images upload
  - Status (DRAFT or ACTIVE)

### Phase 5: Marketplace Page
- [ ] Update marketplace page to display listings
- [ ] Add tabs: All, For Sale (WTS), Wanted (WTB), Trades (WTT)
- [ ] Add filters: region, price range, condition
- [ ] Display listing cards with:
  - Cigar image and info
  - Title, description
  - Price, quantity
  - Location
  - Seller info
  - Status badges
- [ ] Pagination/infinite scroll

### Phase 6: Listing Detail Page
- [ ] Create `/marketplace/[id]` page
- [ ] Display full listing details
- [ ] Show seller profile
- [ ] Contact/message seller button
- [ ] Make offer button (for WTS/WTT)
- [ ] Edit/Delete buttons (for listing owner)
- [ ] View count tracking

## API Endpoints Specification

### GET /api/listings
**Query Parameters:**
- type?: 'WTS' | 'WTB' | 'WTT'
- status?: 'ACTIVE' | 'DRAFT' | 'SOLD'
- region?: string
- minPrice?: number (cents)
- maxPrice?: number (cents)
- userId?: string
- limit?: number
- offset?: number

**Response:**
```typescript
{
  success: true,
  listings: Listing[],
  total: number,
  limit: number,
  offset: number
}
```

### POST /api/listings
**Request Body:**
```typescript
{
  type: 'WTS' | 'WTB' | 'WTT',
  title: string,
  description: string,
  cigar_id?: string,
  humidor_item_id?: string,
  qty: number,
  condition?: string,
  price_cents?: number, // Required for WTS
  currency?: string,
  region?: string,
  city?: string,
  meet_up_only?: boolean,
  will_ship?: boolean,
  image_urls?: string[],
  status?: 'DRAFT' | 'ACTIVE'
}
```

### PATCH /api/humidor/[id]/marketplace
**Request Body:**
```typescript
{
  available_for_sale?: number,
  available_for_trade?: number
}
```

## UI/UX Considerations

1. **Humidor Page**:
   - Add toggle/input for each item to set available quantities
   - Visual indicators (badges) for items marked for sale/trade
   - "Create Listing" button that pre-fills the form

2. **Listing Creation**:
   - Step-by-step wizard or single form
   - Validation: quantity cannot exceed available quantity
   - Price suggestions based on MSRP or market average
   - Image upload with preview

3. **Marketplace Page**:
   - Grid/list view toggle
   - Search functionality
   - Sort by: price, date, relevance
   - Filter sidebar
   - Empty states

4. **Listing Detail**:
   - Large image gallery
   - Seller reputation/rating
   - Similar listings
   - Recent activity

## Validation Rules

1. **Quantity Validation**:
   - `available_for_sale` + `available_for_trade` ≤ `quantity - smoked_count`
   - Listing `qty` ≤ `available_for_sale` (for WTS) or `available_for_trade` (for WTT)

2. **Price Validation**:
   - WTS listings require `price_cents > 0`
   - WTT listings can have optional price (asking price)
   - WTB listings don't require price

3. **Status Transitions**:
   - DRAFT → ACTIVE (publish)
   - ACTIVE → SOLD (mark as sold)
   - ACTIVE → WITHDRAWN (cancel listing)
   - Any → FROZEN (admin only)

## Next Steps

1. Run database migration
2. Create API routes
3. Update humidor page UI
4. Create listing creation page
5. Update marketplace page
6. Create listing detail page
7. Add image upload functionality
8. Implement search and filters
9. Add seller messaging/contact
10. Add offer system (future phase)

## Notes

- Listings can be created from humidor items or manually
- A humidor item can have multiple listings (for different quantities)
- When a listing is sold, update the humidor item quantity
- Consider adding a "reserved" quantity to prevent double-selling
- Future: Add offer/negotiation system
- Future: Add transaction tracking
- Future: Add seller ratings and reviews

