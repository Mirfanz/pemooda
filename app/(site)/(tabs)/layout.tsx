import Tabbar from "@/components/site/tabbar";
import { PropsWithChildren } from "react";

export default function TabsLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex-1 flex flex-col h-dvh! overflow-hidden">
      <div className="flex-1 overflow-x-hidden scrollbar-hide">{children}</div>
      <Tabbar className="" />
    </div>
  );
}
