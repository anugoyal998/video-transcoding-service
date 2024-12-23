/*
  Warnings:

  - Added the required column `multipartUploadId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "multipartUploadId" TEXT NOT NULL;
