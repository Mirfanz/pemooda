"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
      setIsLoading(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        setError(errorData.message || "Failed to load attendance");
      } else {
        setError("An unexpected error occurred");
      }
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
      const response = await axios.post(
        `/api/attendance/${attendanceId}/scan`,
        {},
      );

      setHasScanned(true);

      const attendedAt = response.data.data?.attendedAt;
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

      // Redirect back after success
      setTimeout(() => {
        router.back();
      }, 3000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: errorData.message || "Gagal mencatat kehadiran",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Terjadi kesalahan yang tidak terduga",
        });
      }
    } finally {
      setIsScanLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="rounded-lg h-48" />
        <Skeleton className="rounded-lg h-32" />
      </div>
    );
  }

  if (error || !attendanceInfo) {
    return (
      <Alert
        color="danger"
        title="Error"
        description={error || "Attendance not found"}
      />
    );
  }

  const status: TimeStatus = getTimeStatus(
    attendanceInfo.startDate,
    attendanceInfo.endDate,
  );

  // if (status == "upcoming")
  //   return (
  //     <Alert
  //       color="warning"
  //       title="Belum Dibuka"
  //       description="Absensi ini belum dibuka. Silakan tunggu ketua/sekretaris membuka absensi."
  //     />
  //   );
  // if (status == "ended")
  //   return (
  //     <Alert
  //       color="danger"
  //       title="Sudah Ditutup"
  //       description="Absensi ini sudah ditutup. Anda tidak dapat lagi mencatat kehadiran."
  //     />
  //   );
  if (attendanceInfo.hasAttended)
    return (
      <Alert
        color="success"
        title="Sudah Absen"
        description="Anda sudah mencatat kehadiran di absensi ini."
        startContent={<CheckCircle weight="Bold" className="size-5" />}
      />
    );
  if (hasScanned)
    return (
      <Alert
        color="success"
        title="Berhasil!"
        description="Kehadiran Anda telah tercatat."
        startContent={<CheckCircle weight="Bold" className="size-5" />}
      />
    );

  return (
    <div className="">
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
              {attendanceInfo.allowExternalUsers && (
                <Chip size="sm" color="primary" variant="flat">
                  Terbuka Umum
                </Chip>
              )}
            </div>
          </div>

          {status == "ongoing" &&
            !hasScanned &&
            !attendanceInfo.hasAttended && (
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

          {(hasScanned ||
            attendanceInfo.hasAttended ||
            status != "ongoing") && (
            <Button
              fullWidth
              color="default"
              variant="flat"
              size="lg"
              onPress={() => onClose?.()}
            >
              Kembali
            </Button>
          )}
        </CardBody>
      </Card>

      {status == "ongoing" && (
        <Card className="bg-primary-50 mt-4 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <CardBody className="p-4">
            <p className="text-sm text-center text-primary-700 dark:text-primary-400">
              Pastikan Anda berada di lokasi yang benar sebelum mencatat
              kehadiran
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ScanAttendance;
