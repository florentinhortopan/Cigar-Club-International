# Humidor Club - Updated Architecture

## 🎯 Core Principles

1. **Mobile-First**: Every feature designed for mobile, enhanced for desktop
2. **Cigar Domain Focused**: Respect traditional cigar terminology and workflows
3. **AI-Powered**: Natural language interface via Open Notebook integration
4. **Modern Stack**: SurrealDB + Next.js + React Native principles

---

## 📊 Tech Stack Changes

### Database: SurrealDB (Instead of PostgreSQL)

**Why SurrealDB?**
- 🚀 Multi-model: Supports graph, document, and relational queries
- 🔍 Built-in full-text search
- 🌐 Real-time subscriptions out of the box
- 📱 Perfect for mobile apps (offline-first capabilities)
- 🔗 Graph relations ideal for cigar genealogy (brand → line → vitola)
- 🎯 Native support for complex queries (perfect for Open Notebook)

**Key Features for Cigar Club**:
```surrealql
-- Natural cigar relationships
RELATE brand->produces->line->contains->cigar
RELATE user->owns->humidor_item->references->cigar
RELATE user->rates->cigar SET rating = 4.5
```

### Open Notebook Integration

**Architecture**:
```
┌─────────────────────────────────────────────────┐
│                 Mobile App                      │
│            (Next.js PWA / React Native)         │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│              Next.js API Layer                  │
│         (Authentication & Business Logic)        │
└──────┬──────────────────────────────────────────┘
       │
       ├──────────────────┬──────────────────────┐
       ▼                  ▼                      ▼
┌─────────────┐  ┌──────────────────┐  ┌─────────────┐
│  SurrealDB  │  │  Open Notebook   │  │  Supabase   │
│  (Primary)  │  │  (AI Chat Layer) │  │  (Storage)  │
└─────────────┘  └──────────────────┘  └─────────────┘
                          │
                          ▼
                 ┌────────────────┐
                 │   Vector DB    │
                 │  (Embeddings)  │
                 └────────────────┘
```

**Open Notebook Features**:
1. **Natural Language Queries**: "Show me all Padrón cigars I've rated above 4 stars"
2. **Market Intelligence**: "What's the price trend for Cuban Cohiba over the last 6 months?"
3. **Recommendations**: "Based on my humidor, what should I try next?"
4. **Deal Analysis**: "Are there any undervalued listings in the marketplace?"

---

## 📱 Mobile-First Design Principles

### 1. Touch-First Interface

**Minimum Touch Targets**: 44x44px (Apple) / 48x48dp (Android)

```tsx
// ✅ Good - Mobile optimized
<Button className="min-h-[44px] min-w-[44px] p-4">
  <Icon size={24} />
</Button>

// ❌ Bad - Too small for touch
<Button className="p-1">
  <Icon size={12} />
</Button>
```

### 2. Bottom Navigation

**Primary actions at thumb-reach**:
```tsx
// Mobile navigation at bottom
<nav className="fixed bottom-0 inset-x-0 safe-area-pb">
  <BottomNavigation>
    <NavItem icon="home" label="Home" />
    <NavItem icon="search" label="Discover" />
    <NavItem icon="plus" label="Add" /> {/* Center, larger */}
    <NavItem icon="humidor" label="Humidor" />
    <NavItem icon="profile" label="Profile" />
  </BottomNavigation>
</nav>
```

### 3. Vertical-First Layouts

**Stack content vertically, expand horizontally on desktop**:
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {cigars.map(cigar => <CigarCard key={cigar.id} cigar={cigar} />)}
</div>
```

### 4. Gesture-Based Interactions

**Swipe, pull-to-refresh, long-press**:
```tsx
// Swipeable listing card
<SwipeableCard
  onSwipeLeft={() => addToWatchlist(listing)}
  onSwipeRight={() => makeOffer(listing)}
>
  <ListingCard listing={listing} />
</SwipeableCard>
```

### 5. Progressive Disclosure

**Show essentials first, details on demand**:
```tsx
// Collapsed by default on mobile
<CigarDetails cigar={cigar}>
  <Summary /> {/* Always visible */}
  <Accordion>
    <AccordionItem title="Composition">
      <WrapperBinderFiller />
    </AccordionItem>
    <AccordionItem title="Tasting Notes">
      <TastingNotesList />
    </AccordionItem>
  </Accordion>
</CigarDetails>
```

---

## 🎯 Cigar Domain Model (Corrected)

### Proper Terminology

**Cigar Anatomy**:
- **Vitola**: The shape/size (e.g., Robusto, Toro, Churchill)
- **Ring Gauge**: Diameter in 64ths of an inch
- **Length**: Measured in inches or millimeters
- **Wrapper**: Outer leaf (most visible)
- **Binder**: Holds the filler together
- **Filler**: Interior tobacco blend

**Market Structure**:
- **Manufacturer/Brand**: Company (e.g., Padrón, Davidoff)
- **Line/Series**: Product line (e.g., 1926 Series, Winston Churchill)
- **Release**: Specific production run (year, batch, factory)
- **Box Code**: Identifies factory and date

### SurrealDB Schema

```surrealql
-- Brand table with rich metadata
DEFINE TABLE brand SCHEMAFULL;
DEFINE FIELD name ON brand TYPE string;
DEFINE FIELD slug ON brand TYPE string;
DEFINE FIELD country ON brand TYPE string;
DEFINE FIELD founded ON brand TYPE int;
DEFINE FIELD description ON brand TYPE string;
DEFINE FIELD logo_url ON brand TYPE string;
DEFINE INDEX brand_name ON brand COLUMNS name UNIQUE;
DEFINE INDEX brand_slug ON brand COLUMNS slug UNIQUE;

-- Line (Product series under a brand)
DEFINE TABLE line SCHEMAFULL;
DEFINE FIELD name ON line TYPE string;
DEFINE FIELD slug ON line TYPE string;
DEFINE FIELD brand ON line TYPE record<brand>;
DEFINE FIELD release_year ON line TYPE int;
DEFINE FIELD discontinued ON line TYPE bool DEFAULT false;
DEFINE FIELD description ON line TYPE string;
DEFINE INDEX line_slug ON line COLUMNS brand, slug UNIQUE;

-- Cigar (Specific vitola within a line)
DEFINE TABLE cigar SCHEMAFULL;
DEFINE FIELD line ON cigar TYPE record<line>;
DEFINE FIELD vitola ON cigar TYPE string; -- Robusto, Toro, etc.
DEFINE FIELD ring_gauge ON cigar TYPE int; -- e.g., 50
DEFINE FIELD length_mm ON cigar TYPE int; -- e.g., 127
DEFINE FIELD wrapper ON cigar TYPE string; -- Maduro, Connecticut, etc.
DEFINE FIELD binder ON cigar TYPE string;
DEFINE FIELD filler ON cigar TYPE string; -- Can be array of tobaccos
DEFINE FIELD strength ON cigar TYPE string; -- Mild, Medium, Full
DEFINE FIELD body ON cigar TYPE string; -- Light, Medium, Full
DEFINE FIELD msrp_cents ON cigar TYPE int;
DEFINE FIELD country ON cigar TYPE string; -- Country of manufacture
DEFINE INDEX cigar_line ON cigar COLUMNS line, vitola;

-- Release (Specific batch/production)
DEFINE TABLE release SCHEMAFULL;
DEFINE FIELD cigar ON release TYPE record<cigar>;
DEFINE FIELD box_code ON release TYPE string; -- Factory code
DEFINE FIELD box_date ON release TYPE datetime;
DEFINE FIELD year ON release TYPE int;
DEFINE FIELD limited_edition ON release TYPE bool DEFAULT false;
DEFINE FIELD production_qty ON release TYPE int;
DEFINE FIELD market_status ON release TYPE string; -- Current, Retired, Rare
DEFINE INDEX release_code ON release COLUMNS box_code;

-- Graph relations for natural queries
DEFINE TABLE produces SCHEMAFULL;
DEFINE FIELD in ON produces TYPE record<brand>;
DEFINE FIELD out ON produces TYPE record<line>;

DEFINE TABLE contains SCHEMAFULL;
DEFINE FIELD in ON contains TYPE record<line>;
DEFINE FIELD out ON contains TYPE record<cigar>;

DEFINE TABLE has_release SCHEMAFULL;
DEFINE FIELD in ON has_release TYPE record<cigar>;
DEFINE FIELD out ON has_release TYPE record<release>;

-- Humidor (User collection)
DEFINE TABLE humidor_item SCHEMAFULL;
DEFINE FIELD user ON humidor_item TYPE record<user>;
DEFINE FIELD cigar ON humidor_item TYPE record<cigar>;
DEFINE FIELD release ON humidor_item TYPE option<record<release>>;
DEFINE FIELD quantity ON humidor_item TYPE int;
DEFINE FIELD is_collectible ON humidor_item TYPE bool DEFAULT false;
DEFINE FIELD condition ON humidor_item TYPE string; -- Mint, Good, Fair
DEFINE FIELD provenance ON humidor_item TYPE string;
DEFINE FIELD acquired_at ON humidor_item TYPE datetime;
DEFINE FIELD acquired_price_cents ON humidor_item TYPE int;
DEFINE FIELD storage_conditions ON humidor_item TYPE object; -- {temp, humidity, location}
DEFINE INDEX humidor_user ON humidor_item COLUMNS user;

-- Tasting Note
DEFINE TABLE tasting_note SCHEMAFULL;
DEFINE FIELD user ON tasting_note TYPE record<user>;
DEFINE FIELD cigar ON tasting_note TYPE record<cigar>;
DEFINE FIELD rating ON tasting_note TYPE float; -- 1-5
DEFINE FIELD smoke_date ON tasting_note TYPE datetime;
DEFINE FIELD smoke_duration_mins ON tasting_note TYPE int;
DEFINE FIELD aroma ON tasting_note TYPE array<string>; -- ["cedar", "leather", "coffee"]
DEFINE FIELD draw ON tasting_note TYPE string; -- Tight, Perfect, Loose
DEFINE FIELD burn ON tasting_note TYPE string; -- Uneven, Good, Perfect
DEFINE FIELD ash_quality ON tasting_note TYPE string; -- Flaky, Firm, Very Firm
DEFINE FIELD strength ON tasting_note TYPE string;
DEFINE FIELD body ON tasting_note TYPE string;
DEFINE FIELD flavor_profile ON tasting_note TYPE object; -- {first_third, second_third, final_third}
DEFINE FIELD notes ON tasting_note TYPE string; -- Rich text
DEFINE FIELD paired_with ON tasting_note TYPE string; -- Beverage
DEFINE FIELD occasion ON tasting_note TYPE string; -- After dinner, morning, etc.

-- Marketplace Listing
DEFINE TABLE listing SCHEMAFULL;
DEFINE FIELD user ON listing TYPE record<user>;
DEFINE FIELD type ON listing TYPE string; -- WTS, WTB, WTT
DEFINE FIELD title ON listing TYPE string;
DEFINE FIELD description ON listing TYPE string;
DEFINE FIELD cigar ON listing TYPE option<record<cigar>>;
DEFINE FIELD release ON listing TYPE option<record<release>>;
DEFINE FIELD quantity ON listing TYPE int;
DEFINE FIELD condition ON listing TYPE string;
DEFINE FIELD price_cents ON listing TYPE int;
DEFINE FIELD currency ON listing TYPE string DEFAULT "USD";
DEFINE FIELD location ON listing TYPE object; -- {city, region, country}
DEFINE FIELD meet_up_only ON listing TYPE bool DEFAULT true;
DEFINE FIELD will_ship ON listing TYPE bool DEFAULT false;
DEFINE FIELD status ON listing TYPE string DEFAULT "DRAFT";
DEFINE FIELD published_at ON listing TYPE datetime;
DEFINE FIELD photos ON listing TYPE array<string>; -- URLs
DEFINE INDEX listing_user ON listing COLUMNS user, status;
DEFINE INDEX listing_active ON listing COLUMNS status, published_at;

-- Example queries that Open Notebook can execute
/*
-- "Show me all Padrón cigars in my humidor"
SELECT * FROM humidor_item 
WHERE cigar.line.brand.name = "Padrón"
AND user = $auth.id;

-- "What's the average rating for Cuban cigars?"
SELECT 
  cigar.country, 
  math::avg(rating) as avg_rating,
  count() as total_ratings
FROM tasting_note
WHERE cigar.country = "Cuba"
GROUP BY cigar.country;

-- "Find undervalued listings compared to market average"
SELECT 
  listing.*,
  (SELECT math::avg(price_cents) FROM comp WHERE release = listing.release) as market_avg
FROM listing
WHERE status = "ACTIVE"
AND price_cents < (SELECT math::avg(price_cents) FROM comp WHERE release = listing.release) * 0.8;
*/
```

---

## 🤖 Open Notebook Integration

### Setup

```typescript
// lib/open-notebook.ts
import { OpenNotebook } from '@open-notebook/sdk';

const notebook = new OpenNotebook({
  apiUrl: process.env.OPEN_NOTEBOOK_URL,
  apiKey: process.env.OPEN_NOTEBOOK_API_KEY,
  databaseType: 'surrealdb',
  databaseUrl: process.env.SURREALDB_URL,
  namespace: 'humidor_club',
  database: 'production',
});

export async function queryWithNaturalLanguage(
  userId: string,
  query: string
): Promise<NotebookResponse> {
  return await notebook.query({
    user: userId,
    prompt: query,
    context: {
      role: 'cigar_club_assistant',
      instructions: `
        You are an expert cigar sommelier helping members of an exclusive cigar club.
        When answering questions:
        - Use proper cigar terminology (vitola, ring gauge, wrapper, etc.)
        - Reference the user's personal humidor and tasting notes when relevant
        - Consider market trends from the marketplace and comp data
        - Suggest pairings and recommendations based on their preferences
        - Always respect the cigar domain model and traditional cigar culture
      `,
    },
  });
}
```

### Use Cases

**1. Personal Assistant**
```typescript
// "What cigars do I have that pair well with coffee?"
const response = await queryWithNaturalLanguage(
  userId,
  "What cigars do I have that pair well with coffee?"
);
// Returns: List of cigars from user's humidor with coffee pairing notes
```

**2. Market Intelligence**
```typescript
// "Are there any good deals on Padrón 1926 right now?"
const response = await queryWithNaturalLanguage(
  userId,
  "Are there any good deals on Padrón 1926 right now?"
);
// Returns: Active listings below market average with analysis
```

**3. Discovery**
```typescript
// "Based on my ratings, what full-bodied Nicaraguan cigars should I try?"
const response = await queryWithNaturalLanguage(
  userId,
  "Based on my ratings, what full-bodied Nicaraguan cigars should I try?"
);
// Returns: Recommendations with reasoning based on taste profile
```

### Mobile Chat Interface

```tsx
// components/features/chat/notebook-chat.tsx
'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/use-chat';

export function NotebookChat() {
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] safe-area-pb">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input - Always at bottom */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your cigars..."
            onSubmit={sendMessage}
            disabled={isLoading}
          />
          <Button size="icon" disabled={isLoading}>
            <Send size={20} />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-2 overflow-x-auto">
          <QuickActionChip onClick={() => sendMessage("What's in my humidor?")}>
            My Humidor
          </QuickActionChip>
          <QuickActionChip onClick={() => sendMessage("Find deals")}>
            Find Deals
          </QuickActionChip>
          <QuickActionChip onClick={() => sendMessage("Recommend a cigar")}>
            Recommend
          </QuickActionChip>
        </div>
      </div>
    </div>
  );
}
```

---

## 📱 Mobile-First Components

### Cigar Card (Mobile Optimized)

```tsx
// components/features/cigars/cigar-card-mobile.tsx
export function CigarCardMobile({ cigar }: { cigar: Cigar }) {
  return (
    <Card className="overflow-hidden">
      {/* Hero Image - Full width on mobile */}
      <div className="relative aspect-[16/9]">
        <Image
          src={cigar.photos[0]?.url || '/placeholder.jpg'}
          alt={cigar.name}
          fill
          className="object-cover"
        />
        {cigar.limited_edition && (
          <Badge className="absolute top-2 right-2" variant="destructive">
            Limited
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Brand & Line */}
        <div className="text-sm text-muted-foreground">
          {cigar.line.brand.name}
        </div>
        <h3 className="text-lg font-semibold">{cigar.line.name}</h3>
        
        {/* Vitola - Prominent */}
        <div className="text-base mt-1">{cigar.vitola}</div>

        {/* Quick Stats - Icons for mobile */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Ruler size={16} />
            <span>{cigar.ring_gauge}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={16} />
            <span>{cigar.strength}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-current" />
            <span>{cigar.avg_rating || 'N/A'}</span>
          </div>
        </div>

        {/* Price - Large and visible */}
        {cigar.typical_street_cents && (
          <div className="text-2xl font-bold mt-3">
            {formatCurrency(cigar.typical_street_cents)}
          </div>
        )}

        {/* Actions - Full width buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button variant="outline" size="lg" className="w-full">
            <Plus size={20} />
            Add to Humidor
          </Button>
          <Button size="lg" className="w-full">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Bottom Sheet Pattern

```tsx
// components/common/bottom-sheet.tsx
'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function BottomSheet({ 
  trigger, 
  children,
  snapPoints = ['25%', '50%', '100%']
}: BottomSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-xl"
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
        
        <div className="overflow-y-auto h-full pb-8">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Usage: Add to Humidor flow
<BottomSheet
  trigger={
    <Button>
      <Plus /> Add to Humidor
    </Button>
  }
>
  <AddToHumidorForm cigar={cigar} />
</BottomSheet>
```

---

## 🎨 Mobile-First Design System

### Typography Scale (Mobile-Optimized)

```css
/* Base size larger for mobile readability */
:root {
  --font-size-xs: 0.875rem;    /* 14px */
  --font-size-sm: 1rem;         /* 16px */
  --font-size-base: 1.125rem;   /* 18px */
  --font-size-lg: 1.25rem;      /* 20px */
  --font-size-xl: 1.5rem;       /* 24px */
  --font-size-2xl: 2rem;        /* 32px */
  --font-size-3xl: 2.5rem;      /* 40px */
}

/* Desktop: Scale down slightly */
@media (min-width: 768px) {
  :root {
    --font-size-base: 1rem;     /* 16px */
  }
}
```

### Spacing System

```css
/* Mobile spacing - more generous */
:root {
  --space-xs: 0.5rem;   /* 8px */
  --space-sm: 0.75rem;  /* 12px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-2xl: 3rem;    /* 48px */
}
```

### Touch Targets

```tsx
// Minimum touch target sizes
const TouchTarget = {
  MINIMUM: '44px',     // Apple HIG
  COMFORTABLE: '48px', // Android Material
  LARGE: '56px',       // Primary actions
};

// Button component enforces minimum size
<Button className="min-h-[44px] min-w-[44px]">
  Tap Me
</Button>
```

---

## 🔄 Migration Path

### Phase 1: Update Documentation (Current)
- ✅ Update architecture docs for SurrealDB
- ✅ Add mobile-first guidelines
- ✅ Document Open Notebook integration

### Phase 2: Database Migration
```bash
# Install SurrealDB
brew install surrealdb/tap/surreal

# Start SurrealDB
surreal start --log info file://humidor.db

# Migrate Prisma schema to SurrealDB
pnpm add @surrealdb/sdk
```

### Phase 3: Update Components
- Convert all components to mobile-first layouts
- Add bottom navigation
- Implement swipe gestures
- Add bottom sheets for actions

### Phase 4: Open Notebook Setup
```bash
# Clone Open Notebook
git clone https://github.com/lfnovo/open-notebook

# Configure for Humidor Club
cp .env.example .env
# Set SURREALDB_URL, NAMESPACE, DATABASE
```

---

## 📚 Next Steps

1. **Review** updated architecture documents
2. **Install** SurrealDB locally
3. **Convert** Prisma schema to SurrealDB
4. **Redesign** all components mobile-first
5. **Integrate** Open Notebook for AI chat
6. **Test** on actual mobile devices

---

**This architecture respects:**
- ✅ Cigar domain model and terminology
- ✅ Mobile-first experience
- ✅ Modern tech stack (SurrealDB)
- ✅ AI-powered natural language interface
- ✅ Real-time collaborative features
- ✅ Offline-first capabilities

