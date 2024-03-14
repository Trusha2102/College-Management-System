/*
  Warnings:

  - You are about to drop the column `v0` on the `casbin_rule` table. All the data in the column will be lost.
  - You are about to drop the column `v1` on the `casbin_rule` table. All the data in the column will be lost.
  - You are about to drop the column `v2` on the `casbin_rule` table. All the data in the column will be lost.
  - You are about to drop the column `v3` on the `casbin_rule` table. All the data in the column will be lost.
  - You are about to drop the column `v4` on the `casbin_rule` table. All the data in the column will be lost.
  - You are about to drop the column `v5` on the `casbin_rule` table. All the data in the column will be lost.
  - Added the required column `moduleId` to the `casbin_rule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operation` to the `casbin_rule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `casbin_rule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "casbin_rule" DROP COLUMN "v0",
DROP COLUMN "v1",
DROP COLUMN "v2",
DROP COLUMN "v3",
DROP COLUMN "v4",
DROP COLUMN "v5",
ADD COLUMN     "moduleId" INTEGER NOT NULL,
ADD COLUMN     "operation" TEXT NOT NULL,
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "casbin_rule" ADD CONSTRAINT "casbin_rule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casbin_rule" ADD CONSTRAINT "casbin_rule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
