import type { ActivityStatus } from "@/types";

export const getActivityStatus = (
  startDate: Date | string,
  endDate: Date | string | null
): ActivityStatus => {
  const currentDate = new Date();

  if (currentDate < new Date(startDate)) return "upcoming";
  else if (endDate && currentDate < new Date(endDate)) return "ongoing";
  return "ended";
};
