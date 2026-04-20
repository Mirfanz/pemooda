import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { ActivityType } from "@/lib/generated/prisma/enums";
import { Activity } from "@/types";

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
  notes: string[];
}

interface GetActivitiesParams {
  page?: number;
  public?: boolean;
  search?: string;
}

export function useActivities(params: GetActivitiesParams = {}) {
  return useInfiniteQuery({
    queryKey: activityKeys.list(JSON.stringify(params)),
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", pageParam.toString());
      if (params.public !== undefined)
        searchParams.set("public", params.public.toString());
      if (params.search) searchParams.set("search", params.search);

      const response = await axios.get(
        `/api/activity?${searchParams.toString()}`,
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.isLastPage ? undefined : lastPage.meta.page + 1,
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: async () => {
      const response = await axios.get(`/api/activity/${id}`);
      return response.data.data as Activity;
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

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => axios.delete(`/api/activity/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
