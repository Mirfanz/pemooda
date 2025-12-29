"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex mx-auto items-center justify-center min-h-dvh">
      <div className="text-center px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-primary-400">
            404
          </h1>
        </div>

        <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>

        <p className="text-lg text-muted mb-8 max-w-md mx-auto">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href={"/"}>
            <Button size="lg" color="primary" className="animated-button">
              Go Home
            </Button>
          </Link>
          <Button
            size="lg"
            variant="ghost"
            color="primary"
            className="bg-transparent border border-primary"
          >
            Contact Us
          </Button>
        </div>

        <div className="mt-16 text-slate-500 text-sm">
          <p>Error Code: 404 | Not Found</p>
        </div>
      </div>
    </div>
  );
}
