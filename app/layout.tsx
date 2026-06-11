import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import ReduxProviders from "@/app/StoreProvider";
if (process.env.NODE_ENV === "development") {
  require("../wdyr");
}
export const metadata: Metadata = {
  title: "Techsonance Marketplace",
  description: "Multi-vendor marketplace platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    import("react-scan").then(({ scan }) => {
      scan();
    });
  }
  return (
    <html lang="en">
      <body>
        <ReduxProviders>{children}</ReduxProviders>
      </body>
    </html>
  );
}
