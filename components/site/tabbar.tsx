"use client";

import React, { useMemo } from "react";
import { Tab, Tabs } from "@heroui/react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BellBoldIcon,
  CalendarBoldIcon,
  HomeBoldIcon,
  UserBoldIcon,
  WalletBoldIcon,
} from "../icons";

const items = [
  { label: "Home", icon: HomeBoldIcon, href: "/", regex: /^\/$/ },
  {
    label: "Event",
    icon: CalendarBoldIcon,
    href: "/event",
    regex: /^\/event/,
  },
  {
    label: "Finance",
    icon: WalletBoldIcon,
    href: "/finance",
    regex: /^\/finance/,
  },
  {
    label: "Notif",
    icon: BellBoldIcon,
    href: "/notification",
    regex: /^\/notification/,
  },
  {
    label: "Account",
    icon: UserBoldIcon,
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
        className="p-3"
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
            title={<item.icon className="size-4.5" />}
          />
        ))}
      </Tabs>
    </nav>
  );
};

export default Tabbar;
