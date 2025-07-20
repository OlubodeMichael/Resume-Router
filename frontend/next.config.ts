import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Ensure proper routing in production
  trailingSlash: false,
  // Handle API routes properly
  async rewrites() {
    return [];
  },
};

export default nextConfig;
