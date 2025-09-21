import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Ensure proper routing in production
  trailingSlash: false,
  // Configure image domains for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wfyt3kh9osclrdcx.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Handle API routes properly
  async rewrites() {
    return [];
  },
};

export default nextConfig;
