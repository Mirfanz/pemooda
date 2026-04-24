"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Skeleton, Alert, Chip } from "@heroui/react";
import { CheckCircle, QrCode, CalendarMark } from "@solar-icons/react";
import Swal from "sweetalert2";
import axios from "axios";
import * as fns from "date-fns";
import { id } from "date-fns/locale";
import { getTimeStatus } from "@/lib/utils";
import { TimeStatus } from "@/types";
import { timeStatusEnum } from "@/config/enums";

type Props = {
  attendanceId: string;
  onClose?: () => void;
};

type AttendanceInfo = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  allowExternalUsers: boolean;
  activity: {
    id: string;
    title: string;
  };
  hasAttended: boolean;
};

const ScanAttendance = ({ attendanceId, onClose }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [attendanceInfo, setAttendanceInfo] = useState<AttendanceInfo | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    fetchAttendanceInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceId]);

  const fetchAttendanceInfo = async () => {
    try {
      const { data } = await axios.get(`/api/attendance/${attendanceId}/info`);
      setAttendanceInfo(data.data);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Gagal memuat informasi absensi"
        : "Terjadi kesalahan yang tidak terduga";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmScan = async () => {
    if (!attendanceInfo) return;

    const result = await Swal.fire({
      title: "Konfirmasi Absensi",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Kegiatan:</strong> ${attendanceInfo.activity.title}</p>
          <p><strong>Absensi:</strong> ${attendanceInfo.name}</p>
          ${attendanceInfo.description ? `<p class="text-sm text-gray-600">${attendanceInfo.description}</p>` : ""}
          <p class="text-sm text-gray-500 mt-3">Apakah Anda yakin ingin mencatat kehadiran Anda?</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Absen!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      await handleScan();
    }
  };

  const handleScan = async () => {
    setIsScanLoading(true);

    try {
      const { data } = await axios.post(
        `/api/attendance/${attendanceId}/scan`,
        {},
      );
      setHasScanned(true);

      const attendedAt = data.data?.attendedAt;
      const timeText = attendedAt
        ? fns.format(new Date(attendedAt), "HH:mm:ss", { locale: id })
        : "";

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        html: `
          <div class="space-y-2">
            <p>Kehadiran Anda telah tercatat</p>
            ${timeText ? `<p class="text-sm text-gray-600">Waktu: ${timeText} WIB</p>` : ""}
          </div>
        `,
        timer: 3000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        onClose?.();
      }, 3000);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Gagal mencatat kehadiran"
        : "Terjadi kesalahan yang tidak terduga";

      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: message,
      });
    } finally {
      setIsScanLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="space-y-4 p-4">
        <Skeleton className="rounded-lg h-24" />
        <Skeleton className="rounded-lg h-72" />
      </main>
    );
  }

  if (error || !attendanceInfo) {
    return (
      <main className="space-y-4 p-4">
        <Alert
          color="danger"
          title="Error"
          description={error || "Attendance not found"}
        />
        <Button
          fullWidth
          color="default"
          variant="flat"
          size="lg"
          onPress={() => onClose?.()}
        >
          Kembali
        </Button>
      </main>
    );
  }

  const status: TimeStatus = getTimeStatus(
    attendanceInfo.startDate,
    attendanceInfo.endDate,
  );

  const hasUserAttended = hasScanned || attendanceInfo.hasAttended;
  const canScan = status === "ongoing" && !hasUserAttended;

  const statusLabelMap: Record<TimeStatus, string> = {
    upcoming: "Belum Dibuka",
    ongoing: "Berlangsung",
    ended: "Sudah Ditutup",
  };

  const renderStatusAlert = () => {
    if (hasUserAttended) {
      return (
        <Alert
          color="success"
          title="Sudah Absen"
          description="Anda sudah mencatat kehadiran di absensi ini."
        />
      );
    }

    if (status === "ended") {
      return (
        <Alert
          color="danger"
          title="Absensi Ditutup"
          description="Absensi ini sudah ditutup dan tidak dapat diakses lagi."
        />
      );
    }

    return (
      <Alert
        color="warning"
        title="Absensi Belum Dimulai"
        description="Absensi ini belum dimulai."
      />
    );
  };

  return (
    <main className="p-4 space-y-4">
      <Card className="shadow-md">
        <CardBody className="p-6 space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full">
              <QrCode weight="Bold" className="size-16 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarMark
                  weight="Broken"
                  className="size-4 text-default-500"
                />
                <span className="text-xs text-default-500">Kegiatan</span>
              </div>
              <h3 className="text-lg font-semibold">
                {attendanceInfo.activity.title}
              </h3>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle
                  weight="Broken"
                  className="size-4 text-default-500"
                />
                <span className="text-xs text-default-500">Absensi</span>
              </div>
              <h2 className="text-xl font-bold">{attendanceInfo.name}</h2>
            </div>

            {attendanceInfo.description && (
              <p className="text-sm text-default-500">
                {attendanceInfo.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Chip
                size="sm"
                color={timeStatusEnum[status].color}
                variant="flat"
              >
                {statusLabelMap[status]}
              </Chip>
              {attendanceInfo.allowExternalUsers && (
                <Chip size="sm" color="primary" variant="flat">
                  Terbuka Umum
                </Chip>
              )}
            </div>
          </div>

          {renderStatusAlert()}

          <div className="flex flex-col gap-4 mt-2">
            {canScan && (
              <Button
                fullWidth
                color="primary"
                variant="shadow"
                size="lg"
                startContent={<CheckCircle weight="Bold" className="size-5" />}
                onPress={handleConfirmScan}
                isLoading={isScanLoading}
              >
                Catat Kehadiran
              </Button>
            )}

            <Button
              fullWidth
              color="default"
              variant="flat"
              size="lg"
              onPress={() => onClose?.()}
            >
              Kembali
            </Button>
          </div>
        </CardBody>
      </Card>
    </main>
  );
};

export default ScanAttendance;
