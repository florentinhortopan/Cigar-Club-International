-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('WTS', 'WTB', 'WTT');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PENDING', 'SOLD', 'WITHDRAWN', 'FROZEN');

-- AlterTable
ALTER TABLE "HumidorItem" ADD COLUMN     "available_for_sale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "available_for_trade" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cigar_id" TEXT,
    "humidor_item_id" TEXT,
    "qty" INTEGER NOT NULL,
    "condition" TEXT,
    "price_cents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "region" TEXT,
    "city" TEXT,
    "meet_up_only" BOOLEAN NOT NULL DEFAULT true,
    "will_ship" BOOLEAN NOT NULL DEFAULT false,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "sold_at" TIMESTAMP(3),
    "frozen_at" TIMESTAMP(3),
    "frozen_reason" TEXT,
    "image_urls" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_user_id_status_idx" ON "Listing"("user_id", "status");

-- CreateIndex
CREATE INDEX "Listing_status_published_at_idx" ON "Listing"("status", "published_at");

-- CreateIndex
CREATE INDEX "Listing_type_status_idx" ON "Listing"("type", "status");

-- CreateIndex
CREATE INDEX "Listing_cigar_id_idx" ON "Listing"("cigar_id");

-- CreateIndex
CREATE INDEX "Listing_humidor_item_id_idx" ON "Listing"("humidor_item_id");

-- CreateIndex
CREATE INDEX "Listing_region_status_idx" ON "Listing"("region", "status");

-- CreateIndex
CREATE INDEX "HumidorItem_available_for_sale_idx" ON "HumidorItem"("available_for_sale");

-- CreateIndex
CREATE INDEX "HumidorItem_available_for_trade_idx" ON "HumidorItem"("available_for_trade");

-- AddForeignKey
ALTER TABLE "HumidorItem" ADD CONSTRAINT "HumidorItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_cigar_id_fkey" FOREIGN KEY ("cigar_id") REFERENCES "Cigar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
