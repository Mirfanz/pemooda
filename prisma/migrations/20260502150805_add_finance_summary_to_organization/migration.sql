-- AlterTable
ALTER TABLE "organization_summaries" ADD COLUMN     "total_expenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_finance_report" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_incomes" DOUBLE PRECISION NOT NULL DEFAULT 0;
