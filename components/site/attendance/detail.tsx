"use client";

import {
  useAttendance,
  useStartAttendance,
  useEndAttendance,
  useDeleteAttendance,
} from "@/hooks/queries/attendance";
import Navbar from "../navbar";
import {
  Card,
  CardBody,
  Skeleton,
  Button,
  Chip,
  Avatar,
  Divider,
  MenuItem,
  DropdownMenu,
  Dropdown,
  DropdownTrigger,
} from "@heroui/react";
import {
  CheckCircle,
  CloseCircle,
  ClockCircle,
  MinusCircle,
  PlayCircle,
  StopCircle,
  QrCode,
  UsersGroupRounded,
  ForwardRight,
  MenuDots,
  TrashBinMinimalistic,
} from "@solar-icons/react";
import { useAuth } from "@/contexts/auth-context";
import { Role } from "@/lib/generated/prisma/enums";
import Swal from "sweetalert2";
import { QRCodeSVG } from "qrcode.react";
import { AttendeeStatus } from "@/lib/generated/prisma/enums";
import * as fns from "date-fns";
import { id } from "date-fns/locale";
import { TimeStatus } from "@/types";
import { getTimeStatus } from "@/lib/utils";
import { timeStatusEnum } from "@/config/enums";
import { useRouter } from "next/navigation";

type Props = {
  activityId: string;
  attendanceId: string;
};

const AttendanceDetail = ({ activityId, attendanceId }: Props) => {
  const { isLoading, data } = useAttendance(attendanceId);
  const auth = useAuth();
  const router = useRouter();
  const startAttendance = useStartAttendance();
  const endAttendance = useEndAttendance();
  const deleteAttendance = useDeleteAttendance();

  const attendance = data?.attendance;
  const summary = data?.summary;

  const handleStart = async () => {
    const result = await Swal.fire({
      title: "Start Attendance?",
      text: "Members can start scanning QR code",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Start!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await startAttendance.mutateAsync(attendanceId);
        Swal.fire({
          icon: "success",
          title: "Started!",
          text: "Attendance has been started",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: errorMessage,
        });
      }
    }
  };

  const handleEnd = async () => {
    const result = await Swal.fire({
      title: "End Attendance?",
      text: "Pending attendees will be marked as absent",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, End!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await endAttendance.mutateAsync(attendanceId);
        Swal.fire({
          icon: "success",
          title: "Ended!",
          text: "Attendance has been ended",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: errorMessage,
        });
      }
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Attendance?",
      text: "This action cannot be undone. All attendance records will be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteAttendance.mutateAsync(attendanceId);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Attendance has been deleted",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push(`/activity/${activityId}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: errorMessage,
        });
      }
    }
  };

  const handleShare = async () => {
    try {
      // Get QR code SVG element by specific ID
      const qrElement = document.getElementById(
        "qr-attendance",
      ) as SVGElement | null;
      if (!qrElement) {
        throw new Error("QR code not found");
      }

      // Convert SVG to Canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const svgData = new XMLSerializer().serializeToString(qrElement);
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve();
        };
        img.onerror = () => reject(new Error("Failed to load QR code image"));
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
      });

      // Convert Canvas to Blob
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Failed to create blob");

        // Create metadata
        const url = `${window.location.origin}/activity/${activityId}/attendance/${attendanceId}`;
        const startDate = attendance?.startDate
          ? fns.format(new Date(attendance.startDate), "dd MMM yyyy HH:mm", {
              locale: id,
            })
          : "";
        const endDate = attendance?.endDate
          ? fns.format(new Date(attendance.endDate), "dd MMM yyyy HH:mm", {
              locale: id,
            })
          : "";

        const text =
          `Absensi: ${attendance?.name}\n` +
          (startDate && endDate ? `Waktu: ${startDate} - ${endDate}\n` : "") +
          `Link: ${url}`;

        // Try Web Share API
        if (navigator.share) {
          const file = new File([blob], "qr-attendance.png", {
            type: "image/png",
          });

          const shareData = {
            title: `QR Absensi: ${attendance?.name}`,
            text,
            files: [file],
          };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        }

        // Fallback: Copy link to clipboard if share not available
        await navigator.clipboard.writeText(url);
        Swal.fire({
          icon: "success",
          title: "Link Tersalin!",
          text: "Link absensi telah disalin ke clipboard",
          timer: 2000,
          showConfirmButton: false,
        });
      }, "image/png");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error sharing:", err);

      // Fallback: Share URL only
      try {
        const url = `${window.location.origin}/activity/${activityId}/attendance/${attendanceId}`;
        await navigator.clipboard.writeText(url);
        Swal.fire({
          icon: "success",
          title: "Link Tersalin!",
          text: "Link absensi telah disalin ke clipboard",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal Bagikan!",
          text: errorMessage,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Attendance Detail" />
        <main className="p-4 space-y-4">
          <Skeleton className="rounded-lg h-48" />
          <Skeleton className="rounded-lg h-32" />
          <Skeleton className="rounded-lg h-64" />
        </main>
      </div>
    );
  }

  if (!attendance || !summary) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Attendance Detail" />
        <main className="p-4">
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-default-500">Attendance not found</p>
            </CardBody>
          </Card>
        </main>
      </div>
    );
  }

  const status: TimeStatus = getTimeStatus(
    attendance.startDate,
    attendance.endDate,
  );
  const canManage = auth.hasRole([Role.KETUA, Role.SEKRETARIS]);

  const getStatusConfig = (status: AttendeeStatus) => {
    switch (status) {
      case "PRESENT":
        return {
          color: "success" as const,
          icon: CheckCircle,
          label: "Present",
        };
      case "ABSENT":
        return { color: "danger" as const, icon: CloseCircle, label: "Absent" };
      case "EXCUSE":
        return {
          color: "warning" as const,
          icon: MinusCircle,
          label: "Excuse",
        };
      case "PENDING":
        return {
          color: "default" as const,
          icon: ClockCircle,
          label: "Pending",
        };
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar
        title="Attendance Detail"
        endContent={
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly size="sm">
                <MenuDots weight="Linear" className="size-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu variant="flat">
              {canManage ? (
                <MenuItem
                  color="danger"
                  key={"delete"}
                  className="text-danger"
                  startContent={<TrashBinMinimalistic className="size-4" />}
                  onPress={handleDelete}
                >
                  Hapus Absensi
                </MenuItem>
              ) : null}
            </DropdownMenu>
          </Dropdown>
        }
      />

      <main className="space-y-4">
        {/* Header */}
        <section className="px-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            {status == "upcoming" && (
              <Chip
                size="sm"
                color={timeStatusEnum[status].color}
                variant="flat"
              >
                Belum Dibuka
              </Chip>
            )}
            {status == "ongoing" && (
              <Chip
                size="sm"
                color={timeStatusEnum[status].color}
                variant="flat"
              >
                Berlangsung
              </Chip>
            )}
            {status == "ended" && (
              <Chip
                size="sm"
                color={timeStatusEnum[status].color}
                variant="flat"
              >
                Sudah Ditutup
              </Chip>
            )}
            {attendance.allowExternalUsers && (
              <Chip size="sm" color="primary" variant="flat">
                Terbuka Umum
              </Chip>
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {attendance.name}
          </h1>
          {attendance.description && (
            <p className="text-default-600 text-sm whitespace-pre-wrap">
              {attendance.description}
            </p>
          )}
        </section>

        {/* Summary */}
        <section className="px-4">
          <Card className="shadow-md">
            <CardBody className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <UsersGroupRounded
                  weight="Bold"
                  className="size-5 text-primary"
                />
                Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
                  <CheckCircle weight="Bold" className="size-5 text-success" />
                  <div>
                    <p className="text-xs text-default-500">Present</p>
                    <p className="text-lg font-bold text-success">
                      {summary.present}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                  <CloseCircle weight="Bold" className="size-5 text-danger" />
                  <div>
                    <p className="text-xs text-default-500">Absent</p>
                    <p className="text-lg font-bold text-danger">
                      {summary.absent}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                  <MinusCircle weight="Bold" className="size-5 text-warning" />
                  <div>
                    <p className="text-xs text-default-500">Excuse</p>
                    <p className="text-lg font-bold text-warning">
                      {summary.excuse}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-default-100 dark:bg-default-900/20 rounded-lg">
                  <ClockCircle
                    weight="Bold"
                    className="size-5 text-default-500"
                  />
                  <div>
                    <p className="text-xs text-default-500">Pending</p>
                    <p className="text-lg font-bold text-default-700">
                      {summary.pending}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* QR Code - Only for admin when started */}
        {auth.hasRole([Role.BENDAHARA, Role.SEKRETARIS, Role.KETUA]) &&
          status != "ended" && (
            <section className="px-4">
              <Card className="shadow-md">
                <CardBody className="p-4 flex flex-col items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2 self-start">
                    <QrCode weight="Bold" className="size-5 text-primary" />
                    QR Code
                  </h3>
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      id="qr-attendance"
                      value={attendanceId}
                      size={200}
                      level="M"
                    />
                  </div>
                  <p className="text-xs text-center text-default-500">
                    Scan QR code to record attendance
                  </p>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    fullWidth
                    onPress={handleShare}
                  >
                    <ForwardRight weight="Broken" className="size-5" /> Bagikan
                    QR Absensi
                  </Button>
                </CardBody>
              </Card>
            </section>
          )}

        {/* Control Buttons */}
        {canManage && (
          <section className="px-4">
            {!attendance.startDate && (
              <Button
                fullWidth
                color="success"
                variant="shadow"
                size="lg"
                startContent={<PlayCircle weight="Bold" className="size-5" />}
                onPress={handleStart}
                isLoading={startAttendance.isPending}
              >
                Start Attendance
              </Button>
            )}
            {status == "ongoing" && !attendance.endDate && (
              <Button
                fullWidth
                color="danger"
                variant="shadow"
                size="lg"
                startContent={<StopCircle weight="Bold" className="size-5" />}
                onPress={handleEnd}
                isLoading={endAttendance.isPending}
              >
                End Attendance
              </Button>
            )}
          </section>
        )}

        {/* Attendees List */}
        <section className="px-4 pb-4">
          <Card className="shadow-md">
            <CardBody className="p-4">
              <h3 className="font-semibold mb-3">
                Attendees ({attendance.attendees?.length || 0})
              </h3>
              <Divider className="mb-3" />
              {!attendance.attendees || attendance.attendees.length === 0 ? (
                <p className="text-center text-default-500 py-4">
                  No attendees yet
                </p>
              ) : (
                <div className="space-y-2">
                  {attendance.attendees.map((attendee) => {
                    const statusConfig = getStatusConfig(attendee.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors"
                      >
                        <Avatar
                          src={attendee.user?.avatarUrl || undefined}
                          name={attendee.user?.name || attendee.name || "?"}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {attendee.user?.name || attendee.name || "Unknown"}
                          </p>
                          {attendee.attendedAt && (
                            <p className="text-xs text-default-400">
                              {fns.format(
                                new Date(attendee.attendedAt),
                                "HH:mm:ss",
                                { locale: id },
                              )}{" "}
                              WIB
                            </p>
                          )}
                          {attendee.email && !attendee.attendedAt && (
                            <p className="text-xs text-default-400">
                              {attendee.email}
                            </p>
                          )}
                        </div>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={statusConfig.color}
                          startContent={
                            <StatusIcon weight="Bold" className="size-3 ms-1" />
                          }
                        >
                          {statusConfig.label}
                        </Chip>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default AttendanceDetail;
