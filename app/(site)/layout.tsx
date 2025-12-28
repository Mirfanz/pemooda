import { PropsWithChildren } from "react";

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex-1 bg-background overflow-y-auto scrollbar-hide flex flex-col shadow-2xl max-w-sm mx-auto">
      {children}
    </div>
  );
}
