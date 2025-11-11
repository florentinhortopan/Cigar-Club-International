-- AlterTable
ALTER TABLE "User" ADD COLUMN     "humidor_public" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_humidor_public_idx" ON "User"("humidor_public");
