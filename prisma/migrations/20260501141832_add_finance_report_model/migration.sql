-- CreateEnum
CREATE TYPE "FinanceReportType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "finance_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "activity_id" TEXT,
    "description" TEXT,
    "type" "FinanceReportType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "finance_reports_organization_id_idx" ON "finance_reports"("organization_id");

-- CreateIndex
CREATE INDEX "finance_reports_created_by_idx" ON "finance_reports"("created_by");

-- CreateIndex
CREATE INDEX "finance_reports_activity_id_idx" ON "finance_reports"("activity_id");

-- AddForeignKey
ALTER TABLE "finance_reports" ADD CONSTRAINT "finance_reports_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_reports" ADD CONSTRAINT "finance_reports_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_reports" ADD CONSTRAINT "finance_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
