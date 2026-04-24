"use client";

import { addToast, Alert, Button, Card, CardBody } from "@heroui/react";
import { QrCode } from "@solar-icons/react";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (result: string) => void;
  onClose?: () => void;
}

const QRScanner = ({ onScan, onClose }: Props) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  // Initialize scanner instance once
  const initializeScanner = () => {
    if (scannerRef.current === null) {
      try {
        scannerRef.current = new Html5Qrcode("preview");
        console.log("QR Scanner initialized");
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
      }
    }
  };

  const startScanning = async () => {
    // Prevent multiple start attempts
    if (isScanningRef.current) return;

    try {
      initializeScanner();
      if (!scannerRef.current) return;

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 60,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
          disableFlip: false,
        },
        (decodedText: string) => {
          onScan(decodedText);
          setIsScanning(false);
          isScanningRef.current = false;
        },
        (errorMessage: string) => {
          // Ignore common parse errors to reduce noise
          if (!errorMessage.includes("QR code parse error")) {
            addToast({
              color: "warning",
              title: "QR code tidak terdeteksi",
              description: "Pastikan QR code terlihat jelas di kamera",
            });
          }
        },
      );

      isScanningRef.current = true;
    } catch (err) {
      addToast({
        color: "danger",
        title: "Gagal mengakses kamera",
        description: "Pastikan Anda memberikan izin akses kamera dan coba lagi",
      });
      console.error("QR Scanner error:", err);
    }
  };

  const stopScanning = async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.stop();
      // IMPORTANT: clear() releases camera and cleans up resources
      await scannerRef.current.clear();
      isScanningRef.current = false;
    } catch (err) {
      // Suppress "Cannot stop scanning" errors
      if (
        err instanceof Error &&
        !err.message?.includes("Cannot stop") &&
        !err.message?.includes("does not have active camera")
      ) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    startScanning();
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    stopScanning();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, []);

  return (
    <main className="p-4 space-y-4">
      <Alert
        color="primary"
        title="Panduan Scan QR Code"
        variant="faded"
        description="Arahkan kamera ke QR code yang ditampilkan oleh ketua/sekretaris untuk mencatat kehadiran."
      />
      <Card className="shadow-md">
        <CardBody className="p-6">
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-2xl border border-default bg-default-50 relative w-full aspect-square">
              <div id="preview" className="size-full" hidden={!isScanning} />
              <div
                className="flex flex-col justify-center items-center size-full p-4"
                hidden={isScanning}
              >
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
            </div>
            {isScanning ? (
              <Button
                onPress={handleStopScanning}
                fullWidth
                color="danger"
                size="lg"
                variant="shadow"
              >
                Stop Scanner
              </Button>
            ) : (
              <Button
                fullWidth
                color="primary"
                variant="shadow"
                size="lg"
                startContent={<QrCode weight="Bold" className="size-5" />}
                onPress={handleStartScanning}
              >
                Buka Scanner QR
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </main>
  );
};

export default QRScanner;
