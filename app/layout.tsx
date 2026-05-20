import type { Metadata } from "next";
import Script from "next/script";
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
      <head>
        <Script id="microsoft-clarity" strategy="beforeInteractive" src="https://www.clarity.ms/tag/wu7dz0nxre" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
