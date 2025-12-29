import { Role } from "@/lib/generated/prisma/enums";
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

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
