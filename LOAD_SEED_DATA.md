# 🌱 Loading Seed Data

## What's In The Seed Data?

Based on **real cigars from Neptune Cigars**, I've created:

### 📦 10 Premium Brands
- **Arturo Fuente** (Dominican Republic) - Legendary premium brand
- **Ashton** (Dominican Republic) - Consistent quality, VSG/ESG lines
- **Davidoff** (Dominican Republic) - Swiss luxury brand
- **Padron** (Nicaragua) - Highest-rated cigars in the world
- **Drew Estate** (Nicaragua) - Liga Privada, Undercrown
- **AJ Fernandez** (Nicaragua) - Master blender
- **Oliva** (Nicaragua) - Serie V Cigar of the Year
- **Alec Bradley** (Honduras) - Prensado Cigar of the Year 2011
- **Aging Room** (Dominican Republic) - Boutique aged tobaccos
- **Romeo y Julieta** (Dominican Republic) - Historic brand

### 🎯 15 Cigar Lines
- Arturo Fuente Hemingway, Opus X, Classic, Don Carlos
- Drew Estate Liga Privada, Undercrown
- Padron 1964, 1926
- Ashton VSG, ESG
- Oliva Serie V
- Alec Bradley Prensado
- Aging Room Quattro
- Romeo y Julieta Reserva Real

### 🔥 16 Specific Cigars (Vitolas)
Real cigars with accurate:
- Sizes (length × ring gauge)
- Wrapper types (Cameroon, Connecticut, Maduro, etc.)
- Strength levels
- Origins
- Descriptions from actual products

### 💰 Pricing Data
- Real MSRP from Neptune Cigars
- Street pricing
- Availability notes
- Limited editions marked

## 🚀 How to Load It

### Step 1: Make Sure SurrealDB is Running

```bash
# In Terminal 1
surreal start --user root --pass root --bind 0.0.0.0:8000 memory
```

### Step 2: Load the Schema First

```bash
# In Terminal 2
surreal import --conn http://localhost:8000 \
  --user root --pass root \
  --ns humidor_club --db production \
  database/schema.surql
```

You should see: `✅ Schema loaded successfully!`

### Step 3: Load the Seed Data

```bash
surreal import --conn http://localhost:8000 \
  --user root --pass root \
  --ns humidor_club --db production \
  database/seed-data.surql
```

You should see:
```
✅ Seed data loaded successfully!
Summary:
  - 10 brands
  - 15 lines
  - 16 cigars
  - 16 releases
```

### Step 4: Verify the Data

```bash
surreal sql --conn http://localhost:8000 \
  --user root --pass root \
  --ns humidor_club --db production
```

Then run these queries:

```sql
-- See all brands
SELECT * FROM brand ORDER BY name;

-- See Arturo Fuente's lines
SELECT *, ->produces->line.* FROM brand WHERE name = "Arturo Fuente";

-- See all cigars with prices
SELECT 
  cigar.name,
  cigar.vitola,
  cigar.length,
  cigar.ringGauge,
  release.msrp,
  release.averagePrice
FROM release 
FETCH cigar;

-- Most expensive cigars
SELECT 
  cigar.name,
  line.name as line_name,
  release.msrp
FROM release
FETCH cigar, cigar<-contains<-line
ORDER BY release.msrp DESC;
```

## 🎯 What You Can Do Now

Once loaded, you can:

### 1. Browse Cigars
- See 16 real cigars with full details
- Filter by brand, strength, price
- Search by name

### 2. Add to Humidor
- Add any seeded cigar to your collection
- Track quantity
- Add purchase date/price

### 3. Rate & Review
- Add tasting notes
- Rate cigars
- Track pairing ratings

### 4. Create Listings
- List cigars for sale/trade
- Make offers
- Track deals

## 📊 Sample Cigars Included

**Budget-Friendly:**
- Arturo Fuente Exquisitos - $2.77
- Davidoff Mini Cigarillos - $0.80

**Mid-Range:**
- Romeo y Julieta Reserva Real Robusto - $9.16
- Alec Bradley Prensado Churchill - $8.95

**Premium:**
- Liga Privada No. 9 - $13.45
- Padron 1964 Principe - $12.15

**Ultra-Premium:**
- Arturo Fuente Opus X PerfecXion X - $38.34

**Quick Smokes:**
- Hemingway Short Story (4" × 49) - $7.79
- Undercrown Flying Pig (4" × 60) - $13.08

**Long Smokes:**
- Hemingway Classic (7" × 48) - $13.05
- Prensado Churchill (7" × 50) - $8.95

## 🔥 Featured Cigars

### Arturo Fuente Hemingway Short Story
- **Size**: 4" × 49 (Perfecto)
- **Wrapper**: African Cameroon
- **Strength**: Medium
- **Price**: $7.79
- **Perfect for**: Quick 30-minute smoke

### Liga Privada No. 9
- **Size**: 6" × 52 (Toro)
- **Wrapper**: Connecticut Broadleaf Maduro
- **Strength**: Full
- **Price**: $13.45
- **Notes**: Originally made for Drew Estate's personal use

### Opus X PerfecXion X (Angels Share)
- **Size**: 6.25" × 48 (Toro)
- **Wrapper**: Rare Dominican
- **Strength**: Full
- **Price**: $38.34
- **Notes**: Limited - 5 singles max per customer

### Padron 1964 Anniversary Principe
- **Size**: 4.5" × 46 (Robusto)
- **Wrapper**: Nicaraguan
- **Strength**: Full
- **Price**: $12.15
- **Notes**: Box-pressed, 4 years aging

---

**Ready to build features with real data!** 🎉

Next steps:
1. Load the data
2. Test queries
3. Start building the cigar browser
4. Implement "Add to Humidor"

