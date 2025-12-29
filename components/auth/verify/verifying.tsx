"use client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@heroui/react";
import { MailCheckIcon } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import axios from "axios";
import Verified from "./verified";
import Unverified from "./unverified";

const Verifying = () => {
  const { refreshUser, user } = useAuth();
  const { token } = useParams<{ token: string }>();
  const [verifyStatus, setVerfyStatus] = useState<
    "loading" | "success" | "error"
  >();
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleVerify = async () => {
    setVerifyError(null);
    setVerfyStatus("loading");

    try {
      const response = await axios.post("/api/auth/verify", {
        token,
      });

      if (response.data.success) {
        setVerfyStatus("success");
        refreshUser();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setVerifyError(error.response.data.message || "Uknown error occured");
      } else {
        setVerifyError("Terjadi kesalahan");
      }
      setVerfyStatus("error");
    }
  };

  if (verifyStatus === "success") return <Verified />;
  if (verifyStatus === "error")
    return <Unverified errorMessage={verifyError || "Uknown error"} />;

  return (
    <main>
      <div className="flex flex-col mb-6">
        <Button
          color="primary"
          variant="shadow"
          isIconOnly
          className="size-18 shadow-lg mb-4 rounded-3xl"
        >
          <MailCheckIcon className="size-12" />
        </Button>
        <h1 className="text-2xl font-bold mb-2">Verify Account</h1>
        <p className="text-muted text-sm">
          By clicking confirm button bellow your account will be verified.
          Please ignore if you dont want to verify your account.
        </p>
      </div>

      <Button
        isLoading={verifyStatus == "loading"}
        fullWidth
        color="primary"
        onPress={handleVerify}
      >
        {verifyStatus === "loading" ? (
          "Verifying..."
        ) : (
          <>
            <MailCheckIcon className="size-4" />
            Verify Account
          </>
        )}
      </Button>
    </main>
  );
};

export default Verifying;
