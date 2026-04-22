"use client";

import {
  useAttendance,
  useStartAttendance,
  useEndAttendance,
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
} from "@solar-icons/react";
import { useAuth } from "@/contexts/auth-context";
import { Role } from "@/lib/generated/prisma/enums";
import Swal from "sweetalert2";
import { QRCodeSVG } from "qrcode.react";
import { AttendeeStatus } from "@/lib/generated/prisma/enums";
import * as fns from "date-fns";
import { id } from "date-fns/locale";

type Props = {
  activityId: string;
  attendanceId: string;
};

const AttendanceDetail = ({ activityId, attendanceId }: Props) => {
  const { isLoading, data } = useAttendance(attendanceId);
  const auth = useAuth();
  const startAttendance = useStartAttendance();
  const endAttendance = useEndAttendance();

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

  const handleShare = async () => {
    const url = `${window.location.origin}/scan/${attendanceId}`;
    const shareData = {
      title: attendance?.name || "Attendance",
      text: `Scan QR code untuk absensi: ${attendance?.name}`,
      url,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        Swal.fire({
          icon: "success",
          title: "Link Copied!",
          text: "Attendance link has been copied to clipboard",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error sharing:", err);
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

  const isStarted = !!attendance.startDate;
  const isEnded = !!attendance.endDate;
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
      <Navbar title="Attendance Detail" />

      <main className="space-y-4">
        {/* Header */}
        <section className="px-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            {!isStarted && (
              <Chip size="sm" color="default" variant="flat" radius="sm">
                Not Started
              </Chip>
            )}
            {isStarted && !isEnded && (
              <Chip size="sm" color="success" variant="flat" radius="sm">
                Ongoing
              </Chip>
            )}
            {isEnded && (
              <Chip size="sm" color="default" variant="flat" radius="sm">
                Ended
              </Chip>
            )}
            {attendance.allowExternalUsers && (
              <Chip size="sm" color="primary" variant="flat" radius="sm">
                Public
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
        {canManage && isStarted && !isEnded && (
          <section className="px-4">
            <Card className="shadow-md">
              <CardBody className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-semibold flex items-center gap-2 self-start">
                  <QrCode weight="Bold" className="size-5 text-primary" />
                  QR Code
                </h3>
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={`${window.location.origin}/scan/${attendanceId}`}
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
                  Share Link
                </Button>
              </CardBody>
            </Card>
          </section>
        )}

        {/* Control Buttons */}
        {canManage && (
          <section className="px-4">
            {!isStarted && (
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
            {isStarted && !isEnded && (
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
