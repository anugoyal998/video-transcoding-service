/*
  Warnings:

  - Added the required column `fileName` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "VideoTranscodeStatus" ADD VALUE 'NOT_STARTED';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "fileName" TEXT NOT NULL,
ALTER COLUMN "originalS3Path" DROP NOT NULL,
ALTER COLUMN "transcodedS3Path" DROP NOT NULL;
