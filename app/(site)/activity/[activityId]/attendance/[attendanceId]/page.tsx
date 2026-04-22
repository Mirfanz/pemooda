import AttendanceDetail from "@/components/site/attendance/detail";

export default async function AttendanceDetailPage({
  params,
}: {
  params: Promise<{ activityId: string; attendanceId: string }>;
}) {
  const { activityId, attendanceId } = await params;
  return (
    <AttendanceDetail activityId={activityId} attendanceId={attendanceId} />
  );
}
