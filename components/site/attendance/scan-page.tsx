"use client";

import { useState } from "react";
import { addToast } from "@heroui/react";
import Navbar from "../navbar";
import QRScanner from "./scanner";
import ScanAttendance from "./scan";

const ScanPage = () => {
  const [attendanceId, setAttendanceId] = useState<string | null>(null);

  const handleScanResult = async (result: string) => {
    if (!result.trim()) {
      addToast({
        color: "warning",
        title: "QR code tidak valid",
      });
      return;
    }
    setAttendanceId(result.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Scan Absensi" />

      {attendanceId ? (
        <ScanAttendance
          attendanceId={attendanceId}
          onClose={() => setAttendanceId(null)}
        />
      ) : (
        <QRScanner onScan={handleScanResult} />
      )}
      {/* <main className="p-4 space-y-4">
        <Card className="shadow-md">
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
      </main> */}
    </div>
  );
};

export default ScanPage;
