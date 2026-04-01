import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  onDemandEntries: {
    // Make sure entries are not getting disposed in development
    maxInactiveAge: 1000 * 60 * 60,
    pagesBufferLength: 100,
  },
  allowedDevOrigins: ['http://192.168.43.1:3000', 'http://localhost:3000'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
