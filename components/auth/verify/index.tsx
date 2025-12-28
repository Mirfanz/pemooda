"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Alert, Button, Chip } from "@heroui/react";
import {
  MailCheckIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Verified from "./verified";

const Verify = () => {
  const router = useRouter();
  const { user, refreshUser, isLoading, logout } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [checkStatusMessage, setCheckStatusMessage] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await axios.get("/api/auth/me/email");
        if (response.data.success) {
          setEmail(response.data.data.email);
        }
      } catch (error) {
        console.error("Failed to fetch email:", error);
      }
    };

    if (user) {
      fetchEmail();
    }
  }, [user]);

  const handleResend = async () => {
    setIsResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const response = await axios.post("/api/auth/verify/resend");

      if (response.data.success) {
        setResendSuccess(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setResendError(
          error.response.data.message || "Gagal mengirim ulang verifikasi"
        );
      } else {
        setResendError("Terjadi kesalahan");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setCheckStatusMessage("");

    try {
      // Refresh user data dari server
      await refreshUser();

      // Tunggu sebentar untuk state update
      setTimeout(() => {
        if (user?.isVerified) {
          setCheckStatusMessage("success");
          // Redirect ke home setelah 1 detik
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          setCheckStatusMessage("not-verified");
        }
        setIsCheckingStatus(false);
      }, 500);
    } catch (error) {
      console.error("Failed to check status:", error);
      setCheckStatusMessage("error");
      setIsCheckingStatus(false);
    }
  };

  if (user?.isVerified) return <Verified />;

  return (
    <main>
      <div className="text-center mb-8">
        <Button className="size-18 shadow-lg mb-4 shadow-primary/40">
          <MailCheckIcon className="size-11" />
        </Button>
        <h1 className="text-3xl font-bold mb-2">Verify Account</h1>
        <p className="text-muted mb-4">
          We&apos;ve sent a verification link to your email <Chip>{email}</Chip>
        </p>
      </div>
      <div className="bg-primary/5 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircleIcon className="size-5" />
          Already Verified?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          If you&apos;ve clicked the verification link in another device or
          browser, click the button below to update your session.
        </p>

        {checkStatusMessage === "success" && (
          <div className="bg-success/10 text-success p-4 rounded-lg text-sm mb-4">
            ✓ Account verified! Redirecting to home...
          </div>
        )}

        {checkStatusMessage === "not-verified" && (
          <Alert status="warning" className="bg-warning/5 mb-6">
            <Alert.Indicator>
              <TriangleAlertIcon className="size-4" />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title>Account Not Verified</Alert.Title>
            </Alert.Content>
          </Alert>
        )}

        {checkStatusMessage === "error" && (
          <div className="bg-danger/10 text-danger p-4 rounded-lg text-sm mb-4">
            Failed to check status. Please try again.
          </div>
        )}

        <Button
          fullWidth
          variant="primary"
          onPress={handleCheckStatus}
          isPending={isCheckingStatus}
        >
          {({ isPending }) => (
            <>
              <CheckCircleIcon className="size-4 mr-2" />
              {isPending ? "Checking..." : "Check Verification Status"}
            </>
          )}
        </Button>
      </div>

      {/* Resend Section */}
      <div className="bg-primary/5 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-3">Didn&apos;t receive the email?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Check your spam folder or click below to resend the verification
          email.
        </p>

        {resendSuccess ? (
          <div className="bg-success/10 text-success p-4 rounded-lg text-sm">
            ✓ Verification email sent successfully! Please check your inbox.
          </div>
        ) : (
          <>
            {resendError && (
              <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm mb-4">
                {resendError}
              </div>
            )}
            <Button
              fullWidth
              variant="secondary"
              onPress={handleResend}
              isPending={isResending}
            >
              {({ isPending }) => (
                <>
                  <RefreshCwIcon className="size-4 mr-2" />
                  {isPending ? "Sending..." : "Resend Verification Email"}
                </>
              )}
            </Button>
          </>
        )}
      </div>
      <div className="mt-6 pt-6 border-t border-border text-center">
        <Button fullWidth variant="ghost" onPress={logout}>
          <ArrowLeftIcon className="size-4" />
          Back to Login
        </Button>
      </div>
    </main>
  );
};

export default Verify;
