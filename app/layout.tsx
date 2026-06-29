import type { Metadata } from "next";
import Script from "next/script";
// @ts-ignore
import "./globals.css";
import ReduxProviders from "@/app/StoreProvider";
import {
  DEFAULT_LANG,
  ENV_DEVELOPMENT,
  REACT_SCAN_SCRIPT_URL,
  SCRIPT_STRATEGY,
  CROSS_ORIGIN,
} from "@/constants";

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
    <html lang={DEFAULT_LANG}>
      <head>
        {process.env.NODE_ENV === ENV_DEVELOPMENT && (
          <Script
            src={REACT_SCAN_SCRIPT_URL}
            strategy={SCRIPT_STRATEGY}
            crossOrigin={CROSS_ORIGIN}
          />
        )}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </head>
      <body>
        <ReduxProviders>{children}</ReduxProviders>
      </body>
    </html>
  );
}
