import type { NextConfig } from "next";
import path from "path";

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
  // Corrige o Turbopack detectando o diretório errado como workspace root
  // devido a um package-lock.json em C:\Users\lucas\
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
