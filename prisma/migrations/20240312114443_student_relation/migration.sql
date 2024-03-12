/*
  Warnings:

  - You are about to drop the column `address_id` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `bank_details_id` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `parent_details_id` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[student_id]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id]` on the table `BankAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id]` on the table `ParentDetails` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `student_id` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `ParentDetails` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_address_id_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_bank_details_id_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_parent_details_id_fkey";

-- DropIndex
DROP INDEX "Student_address_id_key";

-- DropIndex
DROP INDEX "Student_bank_details_id_key";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "student_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "student_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ParentDetails" ADD COLUMN     "student_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "address_id",
DROP COLUMN "bank_details_id",
DROP COLUMN "parent_details_id";

-- CreateIndex
CREATE UNIQUE INDEX "Address_student_id_key" ON "Address"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_student_id_key" ON "BankAccount"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "ParentDetails_student_id_key" ON "ParentDetails"("student_id");

-- AddForeignKey
ALTER TABLE "ParentDetails" ADD CONSTRAINT "ParentDetails_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
