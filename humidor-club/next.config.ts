import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
    // Allow unoptimized images as fallback if remotePatterns doesn't work
    // This ensures images still display even if optimization fails
    unoptimized: false,
  },
};

export default nextConfig;
