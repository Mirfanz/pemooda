"use client";

import React, { useMemo } from "react";
import { Tab, Tabs } from "@heroui/react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BellBing,
  CalendarMark,
  Home,
  UserRounded,
  Wallet,
} from "@solar-icons/react";

const items = [
  { label: "Home", icon: Home, href: "/", regex: /^\/$/ },
  {
    label: "Activity",
    icon: CalendarMark,
    href: "/activity",
    regex: /^\/activity/,
  },
  {
    label: "Finance",
    icon: Wallet,
    href: "/finance",
    regex: /^\/finance/,
  },
  {
    label: "Announcement",
    icon: BellBing,
    href: "/announcement",
    regex: /^\/announcement/,
  },
  {
    label: "Account",
    icon: UserRounded,
    href: "/account",
    regex: /^\/account/,
  },
];

const Tabbar = ({ className, ...props }: {} & React.ComponentProps<"nav">) => {
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    const matchingItem = items.find((item) => item.regex.test(pathname));
    return matchingItem?.href || null;
  }, [pathname]);

  return (
    <nav className={cn(className)} {...props}>
      <Tabs
        className="py-2 px-4"
        fullWidth
        variant="solid"
        selectedKey={activeTab}
        color="primary"
        size="lg"
      >
        {items.map((item) => (
          <Tab
            key={item.href}
            as={Link}
            href={item.href}
            title={<item.icon weight="Bold" className="size-5" />}
          />
        ))}
      </Tabs>
    </nav>
  );
};

export default Tabbar;
