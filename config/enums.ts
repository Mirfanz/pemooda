import {
  ActivityType,
  AttendeeStatus,
  Role,
} from "@/lib/generated/prisma/enums";
import { ActivityStatus, Color, IconSvgProps } from "@/types";
import {
  BookTextIcon,
  EllipsisIcon,
  HandCoinsIcon,
  HeartPulseIcon,
  MegaphoneIcon,
  Users2Icon,
} from "lucide-react";
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
  GATHERING: { label: "Gathering", icon: HeartPulseIcon },
  MEETING: { label: "Meeting", icon: Users2Icon },
  SEMINAR: { label: "Seminar", icon: MegaphoneIcon },
  TRAINING: { label: "Training", icon: BookTextIcon },
  VOLUNTEER: { label: "Volunteer", icon: HandCoinsIcon },
  OTHER: { label: "Lainnya", icon: EllipsisIcon },
};

export const activityStatusEnum: Record<
  ActivityStatus,
  { label: string; color: Color }
> = {
  ENDED: { label: "Selesai", color: "default" },
  ONGOING: { label: "Berlangsung", color: "success" },
  UPCOMING: { label: "Segera", color: "warning" },
};
