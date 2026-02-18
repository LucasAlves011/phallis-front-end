import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8085',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8085/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8085/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
