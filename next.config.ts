import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA and optimization settings
  experimental: {
    optimizeCss: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
