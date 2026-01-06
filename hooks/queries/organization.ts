import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  OrganizationFull,
  OrganizationInvitation,
  OrganizationUser,
} from "@/types";
import { Role } from "@/lib/generated/prisma/enums";

// Query Keys
export const organizationKeys = {
  all: ["organization"] as const,
  detail: () => [...organizationKeys.all, "detail"] as const,
  members: () => [...organizationKeys.all, "members"] as const,
  invitations: () => [...organizationKeys.all, "invitations"] as const,
  myInvitations: () => [...organizationKeys.all, "my-invitations"] as const,
};

export function useOrganizationDetail() {
  return useQuery({
    queryKey: organizationKeys.detail(),
    queryFn: async (): Promise<OrganizationFull> => {
      const response = await axios.get("/api/organization/detail");
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch organization"
        );
      }
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 menit
  });
}

// Organization Members Hook
export function useOrganizationMembers() {
  return useQuery({
    queryKey: organizationKeys.members(),
    queryFn: async (): Promise<OrganizationUser[]> => {
      const response = await axios.get("/api/organization/members");
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch members");
      }
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 menit
  });
}

export function useOrganizationInvitations() {
  return useQuery({
    queryKey: organizationKeys.invitations(),
    queryFn: async (): Promise<OrganizationInvitation[]> => {
      const response = await axios.get("/api/organization/invitations");
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch invitations");
      }
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useMyInvitations() {
  return useQuery({
    queryKey: organizationKeys.myInvitations(),
    queryFn: async (): Promise<OrganizationInvitation[]> => {
      const response = await axios.get("/api/organization/invitations/my");
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch my invitations"
        );
      }
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Mutations
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: Role }) =>
      axios.post("/api/organization/invitations", {
        email,
        role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.invitations(),
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: Role }) =>
      axios.put("/api/organization/members", {
        memberId,
        role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail() });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId }: { memberId: string }) =>
      axios.delete("/api/organization/members", {
        data: { memberId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail() });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string }) =>
      axios.delete("/api/organization/invitations", {
        data: { invitationId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.invitations(),
      });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string }) =>
      axios.post("/api/organization/invitations/accept", {
        invitationId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.invitations(),
      });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.myInvitations(),
      });
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string }) =>
      axios.post("/api/organization/invitations/reject", {
        invitationId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.myInvitations(),
      });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => axios.post("/api/organization/leave"),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: organizationKeys.all });
    },
  });
}
