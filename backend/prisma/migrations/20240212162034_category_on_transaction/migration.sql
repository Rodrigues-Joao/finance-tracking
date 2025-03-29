/*
  Warnings:

  - You are about to drop the column `categoriesId` on the `Transactions` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_categoriesId_fkey";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "categoriesId",
ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
