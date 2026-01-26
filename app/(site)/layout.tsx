import { PropsWithChildren } from "react";

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex-1 bg-background min-h-dvh w-screen flex flex-col shadow-2xl max-w-sm mx-auto relative">
      {children}
    </div>
  );
}
