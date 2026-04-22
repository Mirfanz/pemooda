import NewAttendance from "@/components/site/attendance/new";

export default async function NewAttendancePage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = await params;
  return <NewAttendance activityId={activityId} />;
}
