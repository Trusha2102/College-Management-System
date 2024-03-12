/*
  Warnings:

  - Added the required column `email` to the `ParentDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualification` to the `ParentDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ParentDetails" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "qualification" TEXT NOT NULL;
