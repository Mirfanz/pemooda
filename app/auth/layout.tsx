import { Card, Spinner } from "@heroui/react";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex justify-center items-center m-auto">
      <div className="w-full max-w-lg p-4">
        <Card className="w-full bg-transparent backdrop-blur-sm border p-8 shadow-xl">
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
    </div>
  );
}
