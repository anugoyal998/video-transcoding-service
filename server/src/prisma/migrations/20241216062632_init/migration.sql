/*
  Warnings:

  - You are about to drop the column `status` on the `Video` table. All the data in the column will be lost.
  - Added the required column `transcodeStatus` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadStatus` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VideoUploadStatus" AS ENUM ('STARTED', 'PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "VideoTranscodeStatus" AS ENUM ('STARTED', 'PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SupportedTranscodingFormats" AS ENUM ('FORMAT_240', 'FORMAT_360', 'FORMAT_480', 'FORMAT_720', 'FORMAT_1080');

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "status",
ADD COLUMN     "transcodeStatus" "VideoTranscodeStatus" NOT NULL,
ADD COLUMN     "transcodedFormats" "SupportedTranscodingFormats"[],
ADD COLUMN     "uploadStatus" "VideoUploadStatus" NOT NULL;

-- DropEnum
DROP TYPE "VideoStatus";
