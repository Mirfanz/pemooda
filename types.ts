import {
  ActivityType,
  AttendeeStatus,
  FinanceReportType,
  Role,
} from "@/lib/generated/prisma/enums";
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  isVerified: boolean;
  role: Role | null;
  organization: OrganizationMinimal | null;
}

export interface UserMinimal {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface JWTPayload {
  sub: string;
  user: User;
  iat: number;
  exp: number;
}

export interface OrganizationMinimal {
  id: string;
  name: string;
  imageUrl: string | null;
  tagline: string | null;
}

export interface OrganizationSummary {
  organizationId: string;
  totalMembers: number;
  totalActivities: number;
  totalFinanceReport: number;
  totalExpenses: number;
  totalIncomes: number;
}

export interface Organization extends OrganizationMinimal {
  summary: OrganizationSummary | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  creator: UserMinimal;
  address: string | null;
  phone: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
}

export interface OrganizationUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: Role | null;
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: Role;
  createdAt: Date | string;
  expiresAt: Date | string;
  organization: OrganizationMinimal;
  creator: UserMinimal;
}

export interface ActivityMinimal {
  id: string;
  title: string;
  description: string | null;
  type: ActivityType;
  isPublic: boolean;
  startDate: Date | string;
  endDate: Date | string | null;
  location: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  notes: string[];
  type: ActivityType;
  isPublic: boolean;
  startDate: Date | string;
  endDate: Date | string | null;
  location: string;
  mapsUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  organization: OrganizationMinimal;
}

export type Color =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | undefined;

export type TimeStatus = "upcoming" | "ongoing" | "ended";

export interface Attendance {
  id: string;
  activityId: string;
  name: string;
  description: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  allowExternalUsers: boolean;
  totalPresent: number;
  totalAbsent: number;
  totalExcuse: number;
  totalPending: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  attendees?: Attendee[];
  activity?: {
    id: string;
    title: string;
    description: string | null;
  };
}

export interface AttendanceInfo {
  id: string;
  name: string;
  description: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  allowExternalUsers: boolean;
  activity: {
    id: string;
    title: string;
    description: string | null;
  };
  hasAttended: boolean;
}

export interface Attendee {
  id: string;
  userId: string | null;
  attendanceId: string;
  status: AttendeeStatus;
  attendedAt: Date | string | null;
  excuseDescription: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: UserMinimal;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  excuse: number;
  pending: number;
}

export interface FinanceReport {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  reportDate: Date | string;
  type: FinanceReportType;
  createdAt: Date | string;
  updatedAt: Date | string;
  organization: OrganizationMinimal;
  activity: ActivityMinimal | null;
  creator: UserMinimal;
}
