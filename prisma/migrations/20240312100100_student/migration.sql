/*
  Warnings:

  - Added the required column `examination_no` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joining_after` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mother_tongue` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quota` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ssc_board` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year_of_passing_ssc` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "examination_no" TEXT NOT NULL,
ADD COLUMN     "joining_after" TEXT NOT NULL,
ADD COLUMN     "mother_tongue" TEXT NOT NULL,
ADD COLUMN     "quota" TEXT NOT NULL,
ADD COLUMN     "school_name" TEXT NOT NULL,
ADD COLUMN     "ssc_board" TEXT NOT NULL,
ADD COLUMN     "year_of_passing_ssc" TEXT NOT NULL;
