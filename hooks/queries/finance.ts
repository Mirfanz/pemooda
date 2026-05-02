import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { FinanceReport } from "@/types";
import { FinanceReportType } from "@/lib/generated/prisma/enums";
import { organizationKeys } from "./organization";

export const financeKeys = {
  all: ["finance"] as const,
  reports: () => [...financeKeys.all, "reports"] as const,
  report: (filters: string) => [...financeKeys.reports(), { filters }] as const,
  details: () => [...financeKeys.all, "detail"] as const,
  detail: (id: string) => [...financeKeys.details(), id] as const,
};

interface GetReportsParams {
  page?: number;
  search?: string;
  type?: "income" | "expense";
}

interface CreateReportData {
  title: string;
  description?: string;
  amount: number;
  type: FinanceReportType;
  reportDate: string;
  activityId?: string | null;
}

export function useReports(params: GetReportsParams = {}) {
  return useInfiniteQuery({
    queryKey: financeKeys.report(JSON.stringify(params)),
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", pageParam.toString());
      if (params.search) searchParams.set("search", params.search);
      if (params.type) searchParams.set("type", params.type);

      const response = await axios.get(
        `/api/finance/report?${searchParams.toString()}`,
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.isLastPage ? undefined : lastPage.meta.page + 1,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: financeKeys.detail(id),
    queryFn: async () => {
      const response = await axios.get(`/api/finance/report/${id}`);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch finance report",
        );
      }
      return response.data.data as FinanceReport;
    },
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReportData) =>
      axios.post("/api/finance/report", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.reports() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail() });
    },
  });
}

export function useDeleteFinanceReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => axios.delete(`/api/finance/report/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.reports() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail() });
    },
  });
}
