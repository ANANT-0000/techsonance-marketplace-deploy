import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // webpack: (config, { dev }) => {
  //   if (dev) {
  //     config.devtool = false;
  //   }
  //   return config;
  // },

  allowedDevOrigins: ["192.168.29.28", "localhost", "*"],

  turbopack: {
    // Fix "multiple lockfiles" warning — pin the workspace root explicitly
    root: path.resolve(__dirname),
  },

  experimental: {
    // Only list packages that are actually in package.json
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "recharts",
      "@reduxjs/toolkit",
    ],
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

  typescript: {
    // Bypass Next.js internal typechecker wrapper crash (e.g. getCurrentDirectory error)
    // since we already run independent 'tsc --noEmit' checks.
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**" },
    ],
    qualities: [100, 75, 90],
  },
};

export default nextConfig;
