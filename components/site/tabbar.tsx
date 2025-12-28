"use client";

import {
  BellDotIcon,
  CalendarFoldIcon,
  HomeIcon,
  Wallet2Icon,
} from "lucide-react";
import React from "react";
import { Button } from "@heroui/react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

const items = [
  { label: "Home", icon: HomeIcon, href: "/", regex: /^\/$/ },
  {
    label: "Event",
    icon: CalendarFoldIcon,
    href: "/event",
    regex: /^\/event/,
  },
  {
    label: "Finance",
    icon: Wallet2Icon,
    href: "/finance",
    regex: /^\/finance/,
  },
  {
    label: "Notif",
    icon: BellDotIcon,
    href: "/notification",
    regex: /^\/notification/,
  },
  // { label: "Account", icon: User2Icon, href: "/account", regex: /^\/account/ },
];

const Tabbar = ({ className, ...props }: {} & React.ComponentProps<"nav">) => {
  const pathname = usePathname();
  return (
    <nav
      className={cn(
        "p-3 bg-white shadow-sm border-t flex justify-evenly",
        className
      )}
      {...props}
    >
      {items.map((i) => (
        <Link href={i.href} key={i.href}>
          <Button
            className="flex flex-1 flex-col gap-0 items-center text-muted-foreground data-[active=true]:text-primary"
            variant={"ghost"}
            data-active={pathname.match(i.regex) ? true : false}
          >
            <i.icon className="w-5! h-5!" />
            <small>{i.label}</small>
          </Button>
        </Link>
      ))}
    </nav>
  );
};

export default Tabbar;
