"use client";

import { Button } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { QrReader } from "react-qr-reader";

interface Props {
  onScan: (result: string) => void;
  onClose?: () => void;
}

const QRScanner = ({ onScan, onClose }: Props) => {
  const [scannedResult, setScannedResult] = useState("");
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (scannedResult) {
      onScan(scannedResult);
    }
  }, [scannedResult, onScan]);

  const handleStopScanning = () => {
    setIsScanning(false);

    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    if (onClose) {
      onClose();
    }
  };

  if (!isScanning) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-default bg-default-100">
        <QrReader
          constraints={{
            facingMode: "environment",
            autoGainControl: true,
            aspectRatio: { ideal: 1 },
            frameRate: { ideal: 60 },
          }}
          scanDelay={100}
          ViewFinder={() => {
            return (
              <div className="flex absolute top-8 bottom-8 right-8 left-8 rounded-xl z-50 outline-3 outline-dashed outline-primary/50"></div>
            );
          }}
          videoId="preview"
          onResult={(res, err) => {
            if (res) {
              const scannedText = res.getText();
              setScannedResult(scannedText);
              setError("");
            }
            if (err) {
              setError("Arahkan kamera ke QR code");
            }
          }}
          className="w-full"
        />
      </div>
      <Button
        onPress={handleStopScanning}
        fullWidth
        color="danger"
        size="lg"
        variant="shadow"
      >
        Stop Scanner
      </Button>
    </div>
  );
};

export default QRScanner;
