-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT,
    "founded" INTEGER,
    "description" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Line" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "description" TEXT,
    "release_year" INTEGER,
    "discontinued" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Line_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cigar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "line_id" TEXT NOT NULL,
    "vitola" TEXT NOT NULL,
    "ring_gauge" INTEGER,
    "length_mm" INTEGER,
    "length_inches" REAL,
    "wrapper" TEXT,
    "binder" TEXT,
    "filler" TEXT,
    "filler_tobaccos" TEXT,
    "strength" TEXT,
    "body" TEXT,
    "msrp_cents" INTEGER,
    "typical_street_cents" INTEGER,
    "country" TEXT,
    "factory" TEXT,
    "avg_rating" REAL,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Cigar_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "Line" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cigar_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "batch" TEXT DEFAULT 'Regular Production',
    "limited" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Release_cigar_id_fkey" FOREIGN KEY ("cigar_id") REFERENCES "Cigar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_name_idx" ON "Brand"("name");

-- CreateIndex
CREATE INDEX "Brand_slug_idx" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Line_brand_id_idx" ON "Line"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "Line_brand_id_slug_key" ON "Line"("brand_id", "slug");

-- CreateIndex
CREATE INDEX "Cigar_line_id_idx" ON "Cigar"("line_id");

-- CreateIndex
CREATE INDEX "Release_cigar_id_idx" ON "Release"("cigar_id");

-- CreateIndex
CREATE INDEX "Release_year_idx" ON "Release"("year");
