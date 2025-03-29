/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_categoryId_fkey";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "categoryId";
