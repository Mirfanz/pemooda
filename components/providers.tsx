"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <ToastProvider placement="top-center" toastOffset={15} />
        <AuthProvider>{children}</AuthProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
