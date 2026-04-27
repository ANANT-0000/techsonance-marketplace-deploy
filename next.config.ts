import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['http://192.168.43.1:3000', 'http://localhost:3000'],
  logging: {
    browserToTerminal: false,
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,   // show logs even from HMR-cached fetches
    },
    serverFunctions: true,   // log server action calls
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
