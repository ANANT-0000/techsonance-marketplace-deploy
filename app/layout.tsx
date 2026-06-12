import type { Metadata } from "next";
import Script from "next/script";
// @ts-ignore
import "./globals.css";
import ReduxProviders from "@/app/StoreProvider";

export const metadata: Metadata = {
  title: "Techsonance Marketplace",
  description: "Multi-vendor marketplace platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            strategy="beforeInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <ReduxProviders>{children}</ReduxProviders>
      </body>
    </html>
  );
}
