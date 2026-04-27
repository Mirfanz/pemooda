import {
  ActivityType,
  AttendeeStatus,
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
  organization: Organization | null;
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

export interface Organization {
  id: string;
  name: string;
  imageUrl: string | null;
  tagline: string | null;
}

export interface OrganizationSummary {
  organizationId: string;
  totalMembers: number;
  totalActivities: number;
}

export interface OrganizationFull extends Organization {
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
  organization: Organization;
  creator: UserMinimal;
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
  organization: Organization;
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
  _count?: {
    attendees: number;
  };
  attendees?: Attendee[];
  activity?: {
    id: string;
    title: string;
  };
}

export interface Attendee {
  id: string;
  userId: string | null;
  attendanceId: string;
  status: AttendeeStatus;
  name: string | null;
  email: string | null;
  attendedAt: Date | string | null;
  excuseDescription: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: UserMinimal | null;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  excuse: number;
  pending: number;
}
