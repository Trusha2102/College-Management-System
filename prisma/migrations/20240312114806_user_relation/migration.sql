/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `BankAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_address_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_bank_details_id_fkey";

-- DropIndex
DROP INDEX "User_address_id_key";

-- DropIndex
DROP INDEX "User_bank_details_id_key";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "address_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Address_user_id_key" ON "Address"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_user_id_key" ON "BankAccount"("user_id");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
