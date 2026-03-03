import Detail from "@/components/site/activity/detail";

export default async function DetailActivityPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const activityId = (await params).activityId;
  return <Detail activityId={activityId} />;
}
