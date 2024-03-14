/*
  Warnings:

  - You are about to drop the column `delete_permission` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `read_permission` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `update_permission` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `write_permission` on the `Permission` table. All the data in the column will be lost.
  - Added the required column `operation` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "delete_permission",
DROP COLUMN "read_permission",
DROP COLUMN "update_permission",
DROP COLUMN "write_permission",
ADD COLUMN     "operation" TEXT ;
