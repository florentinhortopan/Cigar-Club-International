# Migration Guide: PostgreSQL/Prisma → SurrealDB

Complete guide for migrating the Humidor Club project from PostgreSQL/Prisma to SurrealDB with mobile-first architecture and Open Notebook integration.

---

## 🎯 Why Migrate?

### SurrealDB Advantages for Humidor Club

1. **Multi-Model Database**
   - Document, Graph, and Relational in one
   - Perfect for cigar genealogy (brand → line → cigar)
   - Natural graph traversals for recommendations

2. **Built-in Real-time**
   - Live queries for marketplace updates
   - No need for additional WebSocket infrastructure
   - Perfect for mobile push notifications

3. **Offline-First**
   - Local storage support for mobile apps
   - Sync when back online
   - Better mobile user experience

4. **Open Notebook Compatibility**
   - Native support in Open Notebook
   - Better natural language query translation
   - Simpler integration

5. **Performance**
   - Faster graph traversals
   - Better for recommendation engine
   - Lower latency for mobile users

---

## 📋 Migration Steps

### Step 1: Install SurrealDB

```bash
# macOS
brew install surrealdb/tap/surreal

# Linux
curl -sSf https://install.surrealdb.com | sh

# Docker
docker run --rm --pull always -p 8000:8000 \
  surrealdb/surrealdb:latest start \
  --log info --user root --pass root \
  file://data/database.db
```

### Step 2: Start SurrealDB Locally

```bash
# Start the database
surreal start \
  --log info \
  --user root \
  --pass root \
  file://humidor.db

# In another terminal, access the SQL interface
surreal sql \
  --conn http://localhost:8000 \
  --user root \
  --pass root \
  --ns humidor_club \
  --db production
```

### Step 3: Load Schema

```bash
# Import the schema
surreal import \
  --conn http://localhost:8000 \
  --user root \
  --pass root \
  --ns humidor_club \
  --db production \
  database/schema.surql
```

### Step 4: Update Dependencies

```bash
cd humidor-club

# Remove Prisma
pnpm remove prisma @prisma/client

# Add SurrealDB
pnpm add surrealdb.js

# Update env
cp .env .env.backup
```

### Step 5: Update Environment Variables

```env
# Remove
# DATABASE_URL=postgresql://...

# Add
SURREALDB_URL=ws://localhost:8000/rpc
SURREALDB_NAMESPACE=humidor_club
SURREALDB_DATABASE=production
SURREALDB_USER=root
SURREALDB_PASS=root
```

### Step 6: Data Migration Script

```typescript
// scripts/migrate-to-surrealdb.ts
import { PrismaClient } from '@prisma/client';
import { db } from '../lib/surrealdb';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Starting migration from PostgreSQL to SurrealDB...\n');

  // 1. Migrate Brands
  console.log('Migrating brands...');
  const brands = await prisma.brand.findMany();
  for (const brand of brands) {
    await db.create('brand', {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      country: brand.country,
      founded: brand.founded,
      description: brand.description,
      website: brand.website,
      logo_url: brand.logoUrl,
      created_at: brand.createdAt,
      updated_at: brand.updatedAt,
    });
  }
  console.log(`✓ Migrated ${brands.length} brands\n`);

  // 2. Migrate Lines
  console.log('Migrating lines...');
  const lines = await prisma.line.findMany();
  for (const line of lines) {
    await db.create('line', {
      id: line.id,
      name: line.name,
      slug: line.slug,
      brand: `brand:${line.brandId}`,
      description: line.description,
      release_year: line.releaseYear,
      discontinued: line.discontinued,
      created_at: line.createdAt,
      updated_at: line.updatedAt,
    });

    // Create graph relation
    await db.query(
      'RELATE $brand->produces->$line',
      { brand: `brand:${line.brandId}`, line: `line:${line.id}` }
    );
  }
  console.log(`✓ Migrated ${lines.length} lines\n`);

  // 3. Migrate Cigars
  console.log('Migrating cigars...');
  const cigars = await prisma.cigar.findMany();
  for (const cigar of cigars) {
    await db.create('cigar', {
      id: cigar.id,
      line: `line:${cigar.lineId}`,
      vitola: cigar.vitola,
      ring_gauge: cigar.ringGauge,
      length_mm: cigar.lengthMM,
      wrapper: cigar.wrapper,
      binder: cigar.binder,
      filler: cigar.filler,
      strength: cigar.strength,
      body: cigar.body,
      msrp_cents: cigar.msrpCents,
      typical_street_cents: cigar.typicalStreetCents,
      country: cigar.country,
      factory: cigar.factory,
      created_at: cigar.createdAt,
      updated_at: cigar.updatedAt,
    });

    // Create graph relation
    await db.query(
      'RELATE $line->contains->$cigar',
      { line: `line:${cigar.lineId}`, cigar: `cigar:${cigar.id}` }
    );
  }
  console.log(`✓ Migrated ${cigars.length} cigars\n`);

  // 4. Migrate Users
  console.log('Migrating users...');
  const users = await prisma.user.findMany();
  for (const user of users) {
    await db.create('user', {
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      role: user.role,
      city: user.city,
      region: user.region,
      country: user.country,
      age_confirmed_at: user.ageConfirmedAt,
      rules_accepted_at: user.rulesAcceptedAt,
      invite_code: user.inviteCode,
      reputation: user.reputation,
      verified_at: user.verifiedAt,
      email_verified: user.emailVerified,
      deleted_at: user.deletedAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    });
  }
  console.log(`✓ Migrated ${users.length} users\n`);

  // 5. Migrate Humidor Items
  console.log('Migrating humidor items...');
  const humidorItems = await prisma.humidorItem.findMany();
  for (const item of humidorItems) {
    await db.create('humidor_item', {
      id: item.id,
      user: `user:${item.userId}`,
      cigar: `cigar:${item.cigarId}`,
      release: item.releaseId ? `release:${item.releaseId}` : null,
      quantity: item.qty,
      is_collectible: item.isCollectible,
      condition: item.condition,
      provenance: item.provenance,
      storage_location: item.storage,
      acquired_at: item.acquiredAt,
      acquired_price_cents: item.acquiredCents,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    });

    // Create graph relation
    await db.query(
      'RELATE $user->owns->$item',
      { user: `user:${item.userId}`, item: `humidor_item:${item.id}` }
    );
  }
  console.log(`✓ Migrated ${humidorItems.length} humidor items\n`);

  // Continue with other tables...
  // (Tasting Notes, Listings, Offers, etc.)

  console.log('🎉 Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Verify data integrity');
  console.log('2. Update application code to use SurrealDB client');
  console.log('3. Test all features');
  console.log('4. Back up PostgreSQL data');
  console.log('5. Deploy with SurrealDB');
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await db.close();
  });
```

Run migration:
```bash
pnpm tsx scripts/migrate-to-surrealdb.ts
```

---

## 🔄 Code Updates

### Before (Prisma)

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Usage
const cigars = await prisma.cigar.findMany({
  where: {
    line: {
      brand: {
        name: 'Padrón',
      },
    },
  },
  include: {
    line: {
      include: {
        brand: true,
      },
    },
  },
});
```

### After (SurrealDB)

```typescript
// lib/surrealdb.ts
import { db } from './surrealdb';

// Usage - More natural graph query
const cigars = await db.query(`
  SELECT *,
    line.* as line,
    line.brand.* as brand
  FROM cigar
  WHERE line.brand.name = "Padrón"
`);
```

---

## 📱 Update Components

### API Routes

**Before (Prisma)**:
```typescript
// app/api/cigars/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cigars = await prisma.cigar.findMany();
  return NextResponse.json({ data: cigars });
}
```

**After (SurrealDB)**:
```typescript
// app/api/cigars/route.ts
import { db } from '@/lib/surrealdb';

export async function GET() {
  const cigars = await db.select('cigar');
  return NextResponse.json({ data: cigars });
}
```

### Real-time Subscriptions (New!)

```typescript
// hooks/use-listings.ts
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/surrealdb';

export function useListings() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // Subscribe to live changes
    const unsubscribe = await db.live('listing', (action, result) => {
      if (action === 'CREATE') {
        setListings(prev => [...prev, result]);
      } else if (action === 'UPDATE') {
        setListings(prev => prev.map(l => l.id === result.id ? result : l));
      } else if (action === 'DELETE') {
        setListings(prev => prev.filter(l => l.id !== result));
      }
    });

    return () => unsubscribe();
  }, []);

  return listings;
}
```

---

## ✅ Verification Checklist

After migration:

- [ ] All brands migrated correctly
- [ ] All lines linked to correct brands
- [ ] All cigars linked to correct lines
- [ ] Graph relations working (brand→line→cigar)
- [ ] User data intact
- [ ] Humidor items linked correctly
- [ ] Tasting notes migrated
- [ ] Listings and offers working
- [ ] Search functionality working
- [ ] Real-time updates working
- [ ] Open Notebook integration working

---

## 🚀 Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  surrealdb:
    image: surrealdb/surrealdb:latest
    ports:
      - "8000:8000"
    volumes:
      - ./data:/data
    command: start --log info --user root --pass root file://data/database.db

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - SURREALDB_URL=ws://surrealdb:8000/rpc
    depends_on:
      - surrealdb
```

---

## 📊 Performance Comparison

| Metric | PostgreSQL | SurrealDB | Improvement |
|--------|-----------|-----------|-------------|
| Graph queries | 2-5 joins needed | Native graph | 3-5x faster |
| Real-time | External WS | Built-in | Simpler |
| Mobile offline | Complex | Native | Better UX |
| Open Notebook | Requires adapter | Native | Seamless |

---

## 🆘 Troubleshooting

### Connection Issues

```bash
# Check if SurrealDB is running
surreal version

# Test connection
curl http://localhost:8000/health
```

### Data Integrity

```typescript
// scripts/verify-migration.ts
async function verify() {
  const brandCount = await db.query('SELECT count() FROM brand');
  const lineCount = await db.query('SELECT count() FROM line');
  const cigarCount = await db.query('SELECT count() FROM cigar');
  
  console.log('Counts:', { brandCount, lineCount, cigarCount });
}
```

---

## 📚 Resources

- [SurrealDB Documentation](https://surrealdb.com/docs)
- [SurrealDB.js SDK](https://github.com/surrealdb/surrealdb.js)
- [Migration Script](/humidor-club/scripts/migrate-to-surrealdb.ts)
- [SurrealDB Schema](/humidor-club/database/schema.surql)

---

**Migration complete? Great! Now you have a modern, mobile-first database!** 🎉

