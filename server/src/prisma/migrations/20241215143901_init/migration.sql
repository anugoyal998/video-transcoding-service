/*
  Warnings:

  - Added the required column `isEmailPassword` to the `Provider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "isEmailPassword" BOOLEAN NOT NULL,
ADD COLUMN     "password" TEXT;
