-- DropForeignKey
ALTER TABLE "Provider" DROP CONSTRAINT "Provider_username_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_username_fkey";

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;
