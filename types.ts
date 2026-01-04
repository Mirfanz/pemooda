import { Role } from "@/lib/generated/prisma/enums";
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

export type ActivityStatus = "upcoming" | "ongoing" | "ended";
export type ActivityType =
  | "MEETING"
  | "TRAINING"
  | "VOLUNTEER"
  | "GATHERING"
  | "SEMINAR"
  | "OTHER";

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  notes: string[];
  status: ActivityStatus;
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
