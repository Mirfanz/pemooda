import {
  ActivityType,
  AttendeeStatus,
  Role,
} from "@/lib/generated/prisma/enums";
import { Color, IconSvgProps } from "@/types";
import { UsersGroupRounded } from "@solar-icons/react";

import { FC } from "react";

export const roleEnum: Record<Role, { label: string; color: Color }> = {
  PEMBINA: { label: "Pembina", color: "default" },
  KETUA: { label: "Ketua", color: "primary" },
  SEKRETARIS: { label: "Sekretaris", color: "secondary" },
  BENDAHARA: { label: "Bendahara", color: "success" },
  ANGGOTA: { label: "Anggota", color: "default" },
  SENIOR: { label: "Senior", color: "default" },
};

export const attendeeStatusEnum: Record<AttendeeStatus, { label: string }> = {
  PENDING: { label: "Belum Absen" },
  ABSENT: { label: "Tidak Hadir" },
  EXCUSE: { label: "Izin" },
  PRESENT: { label: "Hadir" },
};

export const activityTypeEnum: Record<
  ActivityType,
  { label: string; icon: FC<IconSvgProps> }
> = {
  GATHERING: { label: "Gathering", icon: UsersGroupRounded },
  MEETING: { label: "Meeting", icon: UsersGroupRounded },
  SEMINAR: { label: "Seminar", icon: UsersGroupRounded },
  TRAINING: { label: "Training", icon: UsersGroupRounded },
  VOLUNTEER: { label: "Volunteer", icon: UsersGroupRounded },
  OTHER: { label: "Lainnya", icon: UsersGroupRounded },
};
