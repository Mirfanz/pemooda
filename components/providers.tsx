"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { HeroUIProvider, ToastProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service worker registered:", reg);
        })
        .catch((err) => {
          console.error("Service worker registration failed:", err);
        });
    }
  }, []);

  return (
    <HeroUIProvider>
      <ToastProvider placement="top-center" toastOffset={60} />
      <AuthProvider>{children}</AuthProvider>
    </HeroUIProvider>
  );
}
