# Cigar Domain Model & Database Reference

**This is the authoritative reference for understanding cigars and building an accurate cigar database. Consult this document when in doubt.**

---

## What matters in cigars (the domain model)

### Identity & lineage

Brand → Line/Series → Release/Vintage/Factory run → Box/Stick

Factory (e.g., Tabacalera de García, My Father, Plasencia, AJ Fernandez, Joya de Nicaragua, La Aurora, El Titan de Bronze, TABSA/AGANORSA)

Country of make: Dominican Republic, Nicaragua, Honduras, Cuba, USA (premium), Costa Rica, Mexico, etc.

### Vitola & dimensions

Named shapes/sizes: petite corona, corona, corona gorda, robusto (≈50×5), toro (≈52×6), churchill (≈47×7), lancero (≈38×7.5), belicoso/torpedo, perfecto, figurado, gordo (60+), lonsdale, panatela.

Ring gauge is 64ths of an inch; record both mm length and ring.

### Blend

Wrapper (biggest flavor driver): Connecticut Shade/Broadleaf, Habano, Corojo, Criollo, San Andrés (Mexico), Sumatra, Cameroon, Ecuadorian variants.

Binder / Filler: varietals + countries (Nica viso/seco/ligero; DR piloto cubano; Honduras; USA PA broadleaf, etc.). Capture leaf priming and fermentation notes when known.

### Construction

Draw, burn line, ash integrity, bunch/roll style (entubado vs booking), cap style (# of seams), box press vs parejo.

### Sensory

Strength (nicotine impact) vs Body (mouthfeel) vs Intensity (flavor concentration).

Flavor families: woody (cedar/oak), earth/mineral, spice (black/white/red), sweet (molasses/caramel), nutty, cocoa/coffee, dried fruit, floral/herbal, occasional pepper and leather.

Technique: retrohale often reveals spice/citrus/floral; capture as a separate field.

### Aging & storage

Typical sweet spots: fresh/young; 6–18 months post-roll; 3–5 years for many blends; some plateau earlier.

RH 62–69% (many prefer 65–67%) at 64–70°F (18–21°C). Higher temps risk tobacco beetles (>72°F/22°C).

"Plume" vs mold: most "plume" claims are mold; if growth is fuzzy or spreads when wiped—it's mold. Track storage incidents.

### Release metadata

Limited/regular, box codes (where applicable), date/month of roll, market region SKUs, band/version changes.

### Economics

MSRP, street price, tax region, secondary ("comps"), liquidity (how often it trades), and seasonality (holiday spikes).

### Authenticity cues

Band print quality, emboss/deboss, foils, box stamps, warranty seals, factory tells. (Non-Cuban: receipts/SKU/UPC, factory partnerships. Cuban: stamp/seal patterns—be careful and rely on expert review, not algorithmic certainty.)

### Pairing principles (to encode)

Spirits: rum (molasses or agricole), bourbon/rye, Scotch (Islay smoke vs Speyside fruit), Irish, Cognac/Armagnac, brandy.

Coffee & cacao: washed vs natural coffees, roast levels; hot chocolate, dark chocolate % cacao.

Beer & wine: stout/porter, barleywine, sherry (Oloroso/Amontillado), tawny port, Madeira.

Encode pairing theory: match body and sweetness, contrast smoke/peat with sweetness or creaminess; penalize high-tannin dry reds with very spicy sticks.

---

## How to build the best cigar database (accuracy at scale)

### 1) Ontology (controlled vocabularies)

Create strict dictionaries so user input is normalized:

- Countries (ISO)
- Factories (canonical names + aliases)
- Wrappers/Varietals (standard terms + synonyms)
- Vitolas (canonical + common nicknames)
- Flavor lexicon (50–80 terms grouped into families)
- Defects (canoe, tunnel, tight draw, tar, relight frequency)

Version these vocabularies; expose them via API for clients to autocomplete.

### 2) Entity graph & IDs

Canonical IDs:

- `brand_id`
- `line_id`
- `release_id` (year/batch/factory/run)
- `sku_id` (box SKU)
- `stick_id` (optional granularity)

Relationships:
- Release ↔ Factory
- Release ↔ Market Region
- Release ↔ Packaging (box of 10/20; tubos; samplers)

### 3) Evidence & provenance

Every datum gets source + method + timestamp:

- `source_type`: manufacturer statement, retailer spec, member report, moderator verification, photo OCR, auction result.
- `confidence_score` (0–1) computed from source_type × agreement × recency.
- `evidence`: photo links, docs, labels, band close-ups. Store hashes to detect duplicates.

### 4) Data intake strategy

**Primary (authoritative)**: brand/factory submissions (partner program), event sheets, press releases—pipe to a review queue.

**Community UGC**: members propose additions/edits with mandatory evidence photos; trust score gates auto-merge.

**Retail & auction comps**: structured capture (price, date, condition, qty, region) → feeds valuation Index.

**Change detection**: band redesigns, blend reformulations—new release version with diff.

### 5) Quality loop

- **Entity resolution**: fuzzy match + human review for Brand/Line/Vitola variants.
- **Moderator tools**: merge duplicates, split mistaken merges, alias management.
- **Sampling audits**: periodic re-verification of popular lines; spot-check photos vs fields.
- **Anomaly detection**: outlier prices (3σ), sudden Index jumps, suspicious volume from new sellers.

### 6) Scoring & rankings

- **Accuracy**: average confidence across key fields (blend, vitola, factory) weighted by importance.
- **Completeness**: coverage score (required fields present) for each entity.
- **Valuation Index**: rolling median of comps over last 90d with 60/30/10 recency weighting; show liquidity (comps count) and volatility (MAD).

### 7) Sensory model (structured notes)

Store both free-text and facets:

- `strength` (1–5)
- `body` (1–5)
- `intensity` (1–5)
- `retrohale_intensity` (1–5)
- sweet/savory/bitter/sour/umami scales
- `flavor_tags[]` (from lexicon)
- `construction_scores` (draw/burn/ash)

Compute consensus profile per Release and drift over age (time since box date).

### 8) Pairing engine

For each pairing submission:
- beverage taxonomy (category → style → brand/bottle/ABV/roast)
- score (1–5)
- context (morning/evening/after meal)
- and why

Recommend by body match + shared flavor tags + collaborative filtering.

### 9) Storage telemetry (optional but powerful)

Allow members to opt-in to log RH/Temp ranges per humidor; correlate storage bands with reported construction problems and flavor clarity.

---

## Concrete data fields (you can paste into your schema later)

### Release core

- `brand`
- `line`
- `factory`
- `country`
- `vitola_name`
- `ring`
- `length_mm`
- `wrapper_varietal`
- `wrapper_origin`
- `binder[]`
- `filler[]`
- `box_count`
- `box_code` (where applicable)
- `market_status` (regular/limited/discontinued)
- `first_release_at`
- `band_version`

### Economics

- `msrp_cents`
- `typical_street_cents`
- `tax_region`
- `comps[]` { date, price_cents, qty, condition, source, region }
- `index_score`
- `index_confidence`
- `liquidity`

### Sensory & construction

- `strength`
- `body`
- `intensity`
- `retrohale_intensity`
- `flavor_tags[]`
- `defects[]`
- `relight_count`
- `burn_corrections`
- `draw_score`

### Pairings

- `beverage_category`
- `style`
- `brand`
- `label`
- `abv_or_roast`
- `score`
- `notes`

### Provenance & evidence

- `evidence_photos[]` (hash, url, caption)
- `source_type`
- `confidence_score`
- `reviewed_by`
- `verified_at`

---

## Data acquisition roadmap (pragmatic + respectful)

**Founder's set (Day 1–7)**: seed top 300 iconic lines across DR/Nica/Honduras + a handful of factories; 1–2 releases each; 3–5 comps per release pulled from member-submitted receipts and your own historical records (avoid scraping TOS conflicts).

**Partner program (Month 1)**: one-pager for brands/factories to provide specs + photos; grant "Verified Manufacturer" badge.

**Community ramp (Month 1–2)**: incentivize contributions with badges and unlocks (listing caps, "Trusted Seller"). Require photo proof for new releases and for any blend change claims.

**Valuation flywheel (ongoing)**: structured capture of buyer/seller deal prices inside your marketplace → becomes comps with privacy-safe aggregates.

**Periodic expert panels**: quarterly moderated reviews to recalibrate flavor lexicon weights and guard against "review drift".

---

## Pitfalls (and how you'll beat them)

**Inconsistent naming** (e.g., "Habano" used loosely) → enforce varietal + origin split and show examples in UI.

**Mythology vs reality** (e.g., "plume") → clear guidance, photo-based adjudication, tag as incident when reported.

**Secondary price bubbles** → index uses median + MAD, display liquidity; never claim "market value" without confidence band.

**Counterfeits** → require close-up band/box shots for high-value listings; route to mod queue; don't auto-bless authenticity—record probability + rationale.

---

## How this plugs into your app right now

You already have a solid schema in the PRD canvas. To supercharge accuracy:

1. Add **Evidence**, **Confidence**, **Alias**, and **Audit** tables.
2. Add **FlavorTag** + **PairingTaxonomy** tables and constrain inputs.
3. Add **ValidationJob** + **ReviewQueue** (for manufacturer/UGC submissions).
4. Extend **Comp** with `provenance_level` and compute `index_confidence`.
5. Add **AnomalyFlag** to catch price or attribute outliers.

---

**Remember**: This document is your north star when making architectural, data modeling, or feature decisions related to cigars and the database structure.

