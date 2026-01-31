import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '10mb', // Increase from default 1MB to 10MB for image uploads
  },
};

export default nextConfig;
