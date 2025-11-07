-- AddForeignKey
ALTER TABLE "HumidorItem" ADD CONSTRAINT "HumidorItem_cigar_id_fkey" FOREIGN KEY ("cigar_id") REFERENCES "Cigar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
