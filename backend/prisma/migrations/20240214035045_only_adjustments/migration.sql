/*
  Warnings:

  - Added the required column `isOnly` to the `Adjustments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Adjustments" ADD COLUMN     "isOnly" BOOLEAN NOT NULL;
