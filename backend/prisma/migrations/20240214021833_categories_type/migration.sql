/*
  Warnings:

  - Added the required column `categoryTypeId` to the `Categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_categoryId_fkey";

-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "categoryTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "categoryId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CategoryType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "CategoryType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_categoryTypeId_fkey" FOREIGN KEY ("categoryTypeId") REFERENCES "CategoryType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
