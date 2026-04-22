import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Attendance, AttendanceSummary } from "@/types";
import axios from "axios";

export const attendanceKeys = {
  all: ["attendances"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: (activityId: string) =>
    [...attendanceKeys.lists(), activityId] as const,
  details: () => [...attendanceKeys.all, "detail"] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
};

export function useAttendances(activityId: string) {
  return useQuery({
    queryKey: attendanceKeys.list(activityId),
    queryFn: async () => {
      const { data } = await axios.get<{
        success: boolean;
        message: string;
        data: Attendance[];
      }>(`/api/attendance?activityId=${activityId}`);
      return data.data;
    },
  });
}

export function useAttendance(attendanceId: string) {
  return useQuery({
    queryKey: attendanceKeys.detail(attendanceId),
    queryFn: async () => {
      const { data } = await axios.get<{
        success: boolean;
        message: string;
        data: {
          attendance: Attendance;
          summary: AttendanceSummary;
        };
      }>(`/api/attendance/${attendanceId}`);
      return data.data;
    },
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      activityId: string;
      name: string;
      description?: string;
      allowExternalUsers: boolean;
      startDate?: string | null;
      userIds: string[];
    }) => {
      const response = await axios.post<{
        success: boolean;
        message: string;
        data: Attendance;
      }>("/api/attendance", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.list(data.data.activityId),
      });
    },
  });
}

export function useStartAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceId: string) => {
      const response = await axios.post<{
        success: boolean;
        message: string;
        data: Attendance;
      }>(`/api/attendance/${attendanceId}/start`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.detail(data.data.id),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.list(data.data.activityId),
      });
    },
  });
}

export function useEndAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceId: string) => {
      const response = await axios.post<{
        success: boolean;
        message: string;
        data: Attendance;
      }>(`/api/attendance/${attendanceId}/end`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.detail(data.data.id),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.list(data.data.activityId),
      });
    },
  });
}

export function useScanAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      attendanceId: string;
      name?: string;
      email?: string;
    }) => {
      const { attendanceId, ...body } = data;
      const response = await axios.post(
        `/api/attendance/${attendanceId}/scan`,
        body,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.detail(variables.attendanceId),
      });
    },
  });
}
