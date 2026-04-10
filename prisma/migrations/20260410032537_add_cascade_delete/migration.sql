-- DropForeignKey
ALTER TABLE "Concert" DROP CONSTRAINT "Concert_artistId_fkey";

-- AddForeignKey
ALTER TABLE "Concert" ADD CONSTRAINT "Concert_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "TopArtist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
