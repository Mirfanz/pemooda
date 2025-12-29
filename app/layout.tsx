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
        className={`${geistSans.variable} ${poppins.variable} ${geistMono.variable} antialiased min-h-dvh max-w-dvw overflow-x-hidden font-sans bg-linear-to-br bg-fixed from-primary-50 via-background to-primary-100`}
      >
        <Providers>
          <div className="flex min-h-dvh">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
