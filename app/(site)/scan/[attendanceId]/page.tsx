import ScanAttendance from "@/components/site/attendance/scan";

export default async function ScanAttendancePage({
  params,
}: {
  params: Promise<{ attendanceId: string }>;
}) {
  const { attendanceId } = await params;
  return <ScanAttendance attendanceId={attendanceId} />;
}
