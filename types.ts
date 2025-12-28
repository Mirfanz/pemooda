import { Role } from "@/lib/generated/prisma/enums";

export interface UserOrganization {
  id: string;
  name: string;
  tagline: string | null;
}

export interface UserType {
  id: string;
  name: string;
  avatarUrl: string | null;
  isVerified: boolean;
  role: Role | null;
  organization: UserOrganization | null;
}

export interface JWTPayload {
  sub: string; // user id
  name: string;
  avatarUrl: string | null;
  isVerified: boolean;
  role: Role | null;
  organization: UserOrganization | null;
  iat: number;
  exp: number;
}
