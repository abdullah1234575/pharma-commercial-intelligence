import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pharma Commercial Intelligence | Synaptic Analysis",
  description: "Executive commercial intelligence dashboard for pharmaceutical leaders",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  }
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
