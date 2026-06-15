import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://192.168.43.1:3000", "http://localhost:3000", "*"],
  experimental: {
    // Only list packages that are actually in package.json
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "recharts",
      "@reduxjs/toolkit",
    ],
    preloadEntriesOnStart: false,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Keep heavy client-only libs out of the server-side bundle analysis.
  // This speeds up compilation significantly for pdf/canvas libs.
  serverExternalPackages: [
    "jspdf",
    "html2canvas",
    "html-to-image",
    "html2pdf.js",
  ],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**" }
    ],
    qualities: [75, 90],
  },
};

export default nextConfig;
