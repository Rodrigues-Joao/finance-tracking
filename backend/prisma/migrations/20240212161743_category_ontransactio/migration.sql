/*
  Warnings:

  - Added the required column `categoriesId` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Made the column `paymentTypeId` on table `Transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_paymentTypeId_fkey";

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "categoriesId" INTEGER NOT NULL,
ALTER COLUMN "paymentTypeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_paymentTypeId_fkey" FOREIGN KEY ("paymentTypeId") REFERENCES "PaymentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_categoriesId_fkey" FOREIGN KEY ("categoriesId") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
