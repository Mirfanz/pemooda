"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button, Input, Alert, addToast } from "@heroui/react";
import Navbar from "../navbar";
import { QrCode, ArrowRight } from "@solar-icons/react";
import axios from "axios";

const ScanPage = () => {
  const router = useRouter();
  const [attendanceId, setAttendanceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attendanceId.trim()) {
      addToast({
        color: "warning",
        title: "Please enter attendance ID",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verify attendance exists and get info
      await axios.get(`/api/attendance/${attendanceId.trim()}/info`);

      // Redirect to scan confirmation page
      router.push(`/scan/${attendanceId.trim()}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        addToast({
          color: "danger",
          title: errorData.message || "Attendance not found",
        });
      } else {
        addToast({
          color: "danger",
          title: "An error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanQR = () => {
    addToast({
      color: "warning",
      title: "QR Scanner",
      description: "QR Scanner feature coming soon. Please enter ID manually.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Scan Absensi" />

      <main className="p-4 space-y-4">
        <Alert
          color="primary"
          variant="faded"
          title="Cara Absen"
          description="Scan QR code dari ketua/sekretaris atau masukkan ID absensi secara manual"
        />

        <Card className="shadow-md">
          <CardBody className="p-6 space-y-6">
            <div className="flex justify-center">
              <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                <QrCode weight="Bold" className="size-20 text-primary" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">Scan QR Code</h2>
              <p className="text-sm text-default-500">
                Arahkan kamera ke QR code yang ditampilkan oleh ketua/sekretaris
              </p>
            </div>

            <Button
              fullWidth
              color="primary"
              variant="shadow"
              size="lg"
              startContent={<QrCode weight="Bold" className="size-5" />}
              onPress={handleScanQR}
            >
              Buka Scanner QR
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-default-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-default-500">
                  atau
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="ID Absensi"
                placeholder="Masukkan ID absensi"
                labelPlacement="outside"
                variant="flat"
                value={attendanceId}
                onChange={(e) => setAttendanceId(e.target.value)}
                description="Dapatkan ID dari ketua/sekretaris"
              />

              <Button
                fullWidth
                type="submit"
                color="primary"
                variant="flat"
                size="lg"
                endContent={<ArrowRight weight="Bold" className="size-5" />}
                isLoading={isLoading}
              >
                Lanjutkan
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
          <CardBody className="p-4">
            <p className="text-sm text-center text-warning-700 dark:text-warning-400">
              <strong>Catatan:</strong> Pastikan Anda berada di lokasi yang
              benar sebelum melakukan absensi
            </p>
          </CardBody>
        </Card>
      </main>
    </div>
  );
};

export default ScanPage;
