-- CreateEnum
CREATE TYPE "SupportedProviders" AS ENUM ('EMAILPASSWORD', 'GOOGLE', 'GITHUB');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'UPLOADED', 'TRANSCODING', 'TRANSCODED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "providerType" "SupportedProviders" NOT NULL,
    "userDisplayName" TEXT NOT NULL,
    "userProfilePhotoUrl" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id","username")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "originalS3Path" TEXT NOT NULL,
    "transcodedS3Path" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL,
    "uploadProgress" INTEGER NOT NULL,
    "transcodeProgress" INTEGER NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id","username")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_username_key" ON "Provider"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Video_username_key" ON "Video"("username");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
