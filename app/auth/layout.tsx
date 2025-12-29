"use client";
import { Card, Spinner } from "@heroui/react";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 max-w-md m-auto p-4">
      <Card className="w-full bg-transparent rounded-3xl backdrop-blur-sm border border-slate-200 p-8 shadow-xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-2">
              <Spinner />
              Loading...
            </div>
          }
        >
          {children}
        </Suspense>
      </Card>
    </div>
  );
}
