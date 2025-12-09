import type { Metadata } from "next";
import "./globals.css";
import { geistMono, geistSans, poppins } from "@/config/fonts";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Pemooda", template: "%s | Pemooda" },
  description: "Aplikasi karang taruna no.1 di Indonesia",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${poppins.variable} ${geistMono.variable} antialiased h-dvh! flex font-sans bg-linear-to-br from-slate-900 via-slate-800 to-slate-900`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
