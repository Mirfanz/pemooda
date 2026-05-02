import FinanceReportDetail from "@/components/site/finance/report/detail";

export default async function FinanceReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  return <FinanceReportDetail reportId={reportId} />;
}
