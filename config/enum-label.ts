import {
  ActivityType,
  AttendeeStatus,
  Role,
} from "@/lib/generated/prisma/enums";
import { ActivityStatus } from "@/types";

export const roleLabel: Record<Role, string> = {
  PEMBINA: "Pembina",
  KETUA: "Ketua",
  SEKRETARIS: "Sekretaris",
  BENDAHARA: "Bendahara",
  ANGGOTA: "Anggota",
  SENIOR: "Senior",
};

export const attendeeStatusLabel: Record<AttendeeStatus, string> = {
  PENDING: "Belum Absen",
  ABSENT: "Tidak Hadir",
  EXCUSE: "Izin",
  PRESENT: "Hadir",
};

export const activityTypeLabel: Record<ActivityType, string> = {
  GATHERING: "Gathering",
  MEETING: "Meeting",
  OTHER: "Lainnya",
  SEMINAR: "Seminar",
  TRAINING: "Training",
  VOLUNTEER: "Volunteer",
};

export const activityStatusLabel: Record<ActivityStatus, string> = {
  ENDED: "Selesai",
  ONGOING: "Berlangsung",
  UPCOMING: "Segera",
};
