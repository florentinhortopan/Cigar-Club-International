-- AlterTable
ALTER TABLE "HumidorItem" ADD COLUMN     "last_smoked_date" TIMESTAMP(3),
ADD COLUMN     "smoked_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "HumidorItem_last_smoked_date_idx" ON "HumidorItem"("last_smoked_date");
