"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import {
  MailCheckIcon,
  CheckCircleIcon,
} from "lucide-react";

const Verified = () => {
  return (
    <main>
      <div className="flex flex-col mb-6">
        <Button className="size-18 shadow-lg mb-4 bg-success shadow-success/40">
          <MailCheckIcon className="size-12" />
        </Button>
        <h1 className="text-2xl font-bold mb-2 text-success flex gap-1 items-center">
          Account Verified <CheckCircleIcon className="size-6" />
        </h1>
        <p className="text-muted text-sm">
          Your account has been verified. Thank you for joining us.
        </p>
      </div>
      <Link href={"/"}>
        <Button fullWidth>Go Home</Button>
      </Link>
    </main>
  );
};

export default Verified;
