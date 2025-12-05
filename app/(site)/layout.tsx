import { PropsWithChildren } from "react";

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex-1 bg-background overflow-y-auto scrollbar-hide flex flex-col md:max-w-sm md:mx-auto border-slate-200 md:border-x shadow-2xl">
      {children}
    </div>
  );
}
