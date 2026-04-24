"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button, Alert, addToast } from "@heroui/react";
import Navbar from "../navbar";
import { QrCode } from "@solar-icons/react";
import axios from "axios";
import QRScanner from "./scanner";
import ScanAttendance from "./scan";

const ScanPage = () => {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<string | null>(
    null,
  );

  const handleScanResult = async (result: string) => {
    const attendanceId = result;

    if (!attendanceId.trim()) {
      addToast({
        color: "warning",
        title: "QR code tidak valid",
      });
      return;
    }

    try {
      // Verify attendance exists and get info
      // await axios.get(`/api/attendance/${attendanceId.trim()}/info`);
      // Redirect to scan confirmation page
      // router.push(`/scan/${attendanceId.trim()}`);
      setSelectedAttendance(attendanceId.trim());
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
          title: "Terjadi kesalahan",
        });
      }
      setScanning(false);
    }
  };

  const handleScanQR = () => {
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Scan Absensi" />

      <main className="p-4 space-y-4">
        <Alert
          color="warning"
          variant="faded"
          // title="Cara Absen"
          description="Pastikan Anda berada di lokasi yang
              benar sebelum melakukan absensi"
        />

        <Card className="shadow-md" hidden={!!selectedAttendance}>
          {scanning ? (
            <CardBody className="p-6">
              <QRScanner
                onScan={handleScanResult}
                onClose={() => setScanning(false)}
              />
            </CardBody>
          ) : (
            <CardBody className="p-6 space-y-6">
              <div className="aspect-square border border-default rounded-2xl flex flex-col justify-center items-center p-4">
                <div className="p-6 mb-2 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                  <QrCode weight="Bold" className="size-20 text-primary" />
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">Scan QR Code</h2>
                  <p className="text-sm text-default-500">
                    Arahkan kamera ke QR code yang ditampilkan oleh
                    ketua/sekretaris
                  </p>
                </div>
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
            </CardBody>
          )}
        </Card>

        {!!selectedAttendance && (
          <ScanAttendance
            attendanceId={selectedAttendance}
            onClose={() => {
              setSelectedAttendance(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default ScanPage;
