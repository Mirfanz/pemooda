import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ActivityType } from "@/lib/generated/prisma/enums";

export const activityKeys = {
  all: ["activities"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (filters: string) => [...activityKeys.lists(), { filters }] as const,
  details: () => [...activityKeys.all, "detail"] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
};

interface CreateActivityData {
  title: string;
  description?: string;
  location: string;
  mapsUrl?: string;
  type: ActivityType;
  isPublic: boolean;
  startDate: string;
  endDate?: string;
  notes: string[];
}

interface GetActivitiesParams {
  page?: number;
  public?: boolean;
  search?: string;
}

export function useActivities(params: GetActivitiesParams = {}) {
  return useQuery({
    queryKey: activityKeys.list(JSON.stringify(params)),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.public !== undefined)
        searchParams.set("public", params.public.toString());
      if (params.search) searchParams.set("search", params.search);

      const response = await axios.get(
        `/api/activity?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateActivityData) =>
      axios.post("/api/activity", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
