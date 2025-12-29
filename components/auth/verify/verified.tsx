"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import {
  CheckCircleIcon,
} from "lucide-react";

const Verified = () => {
  return (
    <main>
      <div className="flex flex-col mb-6">
        <Button
          isIconOnly
          color="success"
          variant="shadow"
          className="size-18 text-slate-100 rounded-3xl shadow-lg mb-4"
        >
          <CheckCircleIcon className="size-12" />
        </Button>
        <h1 className="text-2xl font-bold mb-2 text-success flex gap-1 items-center">
          Account Verified <CheckCircleIcon className="size-6" />
        </h1>
        <p className="text-muted text-sm">
          Your account has been successfully verified. Thank you for joining us.
        </p>
      </div>
      <Link href={"/"}>
        <Button fullWidth>Go Home</Button>
      </Link>
    </main>
  );
};

export default Verified;
