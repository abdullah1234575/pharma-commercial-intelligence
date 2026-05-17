import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pharma Commercial Intelligence",
  description: "Executive commercial intelligence dashboard for pharmaceutical leaders"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
