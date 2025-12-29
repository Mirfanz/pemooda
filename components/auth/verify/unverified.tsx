"use client";

import { Button } from "@heroui/react";
import {
  AlertOctagonIcon,
  ArrowLeftIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";

const Unverified = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <main>
      <div className="flex flex-col mb-6">
        <Button
          isIconOnly
          color="danger"
          variant="shadow"
          className="size-18 rounded-3xl text-slate-50 shadow-lg mb-4"
        >
          <AlertOctagonIcon className="size-12" />
        </Button>
        <h1 className="text-2xl font-bold mb-2 text-danger flex gap-1 items-center">
          Verification Failed <TriangleAlertIcon className="size-6" />
        </h1>
        <p className="text-muted text-sm">
          {errorMessage}. Go to verify page for get your new verify token.
        </p>
      </div>
      <Link href={"/auth/verify"}>
        <Button fullWidth>
          <ArrowLeftIcon className="size-4" />
          Back To Verify Page
        </Button>
      </Link>
    </main>
  );
};

export default Unverified;
