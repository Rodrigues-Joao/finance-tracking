/*
  Warnings:

  - Made the column `transactionId` on table `Adjustments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Adjustments" DROP CONSTRAINT "Adjustments_transactionId_fkey";

-- AlterTable
ALTER TABLE "Adjustments" ALTER COLUMN "transactionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Adjustments" ADD CONSTRAINT "Adjustments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
