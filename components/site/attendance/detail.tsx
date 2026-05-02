"use client";

import {
  useAttendance,
  useStartAttendance,
  useEndAttendance,
  useDeleteAttendance,
  useMarkAttendeeExcuse,
  useUpdateAttendeeExcuse,
  useCancelAttendeeExcuse,
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
  UserCheck,
  UserCross,
  UserMinus,
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
  const markExcuse = useMarkAttendeeExcuse();
  const updateExcuse = useUpdateAttendeeExcuse();
  const cancelExcuse = useCancelAttendeeExcuse();

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

  const handleMarkExcuse = async (attendeeId: string, attendeeName: string) => {
    const result = await Swal.fire({
      title: "Mark as Excuse?",
      text: `Mark ${attendeeName} as excuse`,
      input: "textarea",
      inputLabel: "Keterangan/Alasan Izin",
      inputPlaceholder: "Masukkan alasan izin...",
      inputAttributes: {
        maxlength: "500",
      },
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Mark!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await markExcuse.mutateAsync({
          attendanceId,
          attendeeId,
          excuseDescription: result.value || undefined,
        });
        Swal.fire({
          icon: "success",
          title: "Marked!",
          text: "Attendee marked as excuse",
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

  const handleEditExcuseDescription = async (
    attendeeId: string,
    attendeeName: string,
    currentDescription: string | null,
  ) => {
    const result = await Swal.fire({
      title: "Edit Excuse Description",
      text: `Edit excuse reason for ${attendeeName}`,
      input: "textarea",
      inputValue: currentDescription || "",
      inputLabel: "Keterangan/Alasan Izin",
      inputPlaceholder: "Masukkan alasan izin...",
      inputAttributes: {
        maxlength: "500",
      },
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await updateExcuse.mutateAsync({
          attendanceId,
          attendeeId,
          excuseDescription: result.value,
        });
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Excuse description updated",
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

  const handleCancelExcuse = async (
    attendeeId: string,
    attendeeName: string,
  ) => {
    const result = await Swal.fire({
      title: "Cancel Excuse?",
      text: `Cancel excuse for ${attendeeName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Cancel!",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        await cancelExcuse.mutateAsync({
          attendanceId,
          attendeeId,
        });
        Swal.fire({
          icon: "success",
          title: "Cancelled!",
          text: "Excuse has been cancelled",
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
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-white"
              >
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
          <Card className="shadow-md">
            <CardBody className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {status === "upcoming" && (
                      <Chip size="sm" color="warning" variant="flat">
                        Belum Dibuka
                      </Chip>
                    )}
                    {status === "ongoing" && (
                      <Chip size="sm" color="success" variant="flat">
                        Berlangsung
                      </Chip>
                    )}
                    {status === "ended" && (
                      <Chip size="sm" color="default" variant="flat">
                        Sudah Ditutup
                      </Chip>
                    )}
                    {attendance.allowExternalUsers && (
                      <Chip size="sm" color="primary" variant="flat">
                        Terbuka Umum
                      </Chip>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {attendance.name}
                  </h1>
                  {attendance.description && (
                    <p className="text-default-600 text-sm whitespace-pre-wrap leading-relaxed">
                      {attendance.description}
                    </p>
                  )}
                </div>
              </div>

              <Divider className="my-3" />

              {/* Timing Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-default-100/50">
                  <PlayCircle
                    weight="Bold"
                    className="size-5 text-success shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-default-500">Dibuka</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {attendance.startDate
                        ? fns.format(
                            new Date(attendance.startDate),
                            "dd MMM yyyy HH:mm",
                            {
                              locale: id,
                            },
                          )
                        : "Belum Dibuka"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg bg-default-100/50">
                  <StopCircle
                    weight="Bold"
                    className="size-5 text-danger shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-default-500">Ditutup</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {attendance.endDate
                        ? fns.format(
                            new Date(attendance.endDate),
                            "dd MMM yyyy HH:mm",
                            {
                              locale: id,
                            },
                          )
                        : "Tidak ditentukan"}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
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
                  <UserCheck weight="Broken" className="size-5 text-success" />
                  <div>
                    <p className="text-xs text-default-500">Present</p>
                    <p className="text-lg font-bold text-success">
                      {summary.present}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                  <UserCross weight="Broken" className="size-5 text-danger" />
                  <div>
                    <p className="text-xs text-default-500">Absent</p>
                    <p className="text-lg font-bold text-danger">
                      {summary.absent}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                  <UserMinus weight="Broken" className="size-5 text-warning" />
                  <div>
                    <p className="text-xs text-default-500">Excuse</p>
                    <p className="text-lg font-bold text-warning">
                      {summary.excuse}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-default-100 dark:bg-default-900/20 rounded-lg">
                  <ClockCircle
                    weight="Broken"
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
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold ">
                  Attendees ({attendance.attendees?.length || 0})
                </h3>
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
              </div>
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
                          src={attendee.user.avatarUrl || undefined}
                          name={attendee.user.name}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {attendee.user.name}
                          </p>
                          {attendee.attendedAt && (
                            <p className="text-xs text-default-400">
                              {fns.format(
                                new Date(attendee.attendedAt),
                                "dd/MM/yyyy HH:mm:ss",
                                { locale: id },
                              )}
                            </p>
                          )}
                          {attendee.user && !attendee.attendedAt && (
                            <p className="text-xs text-default-400">
                              {attendee.user.name}
                            </p>
                          )}
                          {attendee.excuseDescription && (
                            <p className="text-xs text-warning-500 line-clamp-1">
                              {attendee.excuseDescription}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={statusConfig.color}
                            startContent={
                              <StatusIcon
                                weight="Bold"
                                className="size-3 ms-1"
                              />
                            }
                          >
                            {statusConfig.label}
                          </Chip>
                          {canManage && (
                            <Dropdown placement="bottom-end">
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <MenuDots
                                    weight="Linear"
                                    className="size-4"
                                  />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu variant="flat">
                                {attendee.status === "PENDING" ||
                                attendee.status === "ABSENT" ? (
                                  <MenuItem
                                    key="excuse"
                                    onPress={() =>
                                      handleMarkExcuse(
                                        attendee.id,
                                        attendee.user.name,
                                      )
                                    }
                                  >
                                    Mark as Excuse
                                  </MenuItem>
                                ) : attendee.status === "EXCUSE" ? (
                                  <>
                                    <MenuItem
                                      key="edit-excuse"
                                      onPress={() =>
                                        handleEditExcuseDescription(
                                          attendee.id,
                                          attendee.user.name,
                                          attendee.excuseDescription,
                                        )
                                      }
                                    >
                                      Edit Description
                                    </MenuItem>
                                    <MenuItem
                                      key="cancel-excuse"
                                      color="danger"
                                      className="text-danger"
                                      onPress={() =>
                                        handleCancelExcuse(
                                          attendee.id,
                                          attendee.user.name,
                                        )
                                      }
                                    >
                                      Cancel Excuse
                                    </MenuItem>
                                  </>
                                ) : null}
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        </div>
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
