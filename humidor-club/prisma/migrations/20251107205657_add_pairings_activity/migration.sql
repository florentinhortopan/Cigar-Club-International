-- CreateEnum
CREATE TYPE "PairingKind" AS ENUM ('CIGAR', 'FOOD', 'DRINK', 'EVENT', 'STYLE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PAIRING_CREATED');

-- CreateTable
CREATE TABLE "Pairing" (
    "id" TEXT NOT NULL,
    "cigar_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" "PairingKind" NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pairing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "summary" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pairing_cigar_id_idx" ON "Pairing"("cigar_id");

-- CreateIndex
CREATE INDEX "Pairing_user_id_idx" ON "Pairing"("user_id");

-- CreateIndex
CREATE INDEX "Pairing_created_at_idx" ON "Pairing"("created_at");

-- CreateIndex
CREATE INDEX "Activity_user_id_idx" ON "Activity"("user_id");

-- CreateIndex
CREATE INDEX "Activity_created_at_idx" ON "Activity"("created_at");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- AddForeignKey
ALTER TABLE "Pairing" ADD CONSTRAINT "Pairing_cigar_id_fkey" FOREIGN KEY ("cigar_id") REFERENCES "Cigar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pairing" ADD CONSTRAINT "Pairing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
