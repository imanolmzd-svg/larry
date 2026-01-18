/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Add password column with default hashed value of "test1234" for existing users
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL DEFAULT '$2b$10$.LJjC5EB5lhWY5tR5AWOC.gDlPJPkLpKFFtXIz6nUi6al/CKzzWQu';

-- Remove default after setting values for existing rows
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
