"use client";
import React from "react";
import { Button } from "@heroui/react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../icons";

type Props = {
  endContent?: React.ReactNode;
  title: string;
  hideTitle?: boolean;
} & React.ComponentProps<"nav">;

const Navbar = ({
  className,
  title,
  endContent,
  hideTitle,
  ...props
}: Props) => {
  const router = useRouter();
  return (
    <nav className={cn("sticky top-0 z-50", className)} {...props}>
      <div className="flex items-center bg-primary-50 px-4 py-3 rousnded-b-2xl text-foreground gap-2.5">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => router.back()}
          className="text-foreground"
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
        {!hideTitle && <h1 className="font-semibold">{title}</h1>}
        {endContent}
      </div>
    </nav>
  );
};

export default Navbar;
