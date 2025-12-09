import Tabbar from "@/components/site/tabbar";
import { PropsWithChildren } from "react";

export default function TabsLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex-1 flex flex-col h-dvh">
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {children}
      </div>
      <Tabbar className="" />
    </div>
  );
}
