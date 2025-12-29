import Tabbar from "@/components/site/tabbar";
import { PropsWithChildren } from "react";

export default function TabsLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1">{children}</div>
      <Tabbar className="sticky! bottom-0" />
    </div>
  );
}
