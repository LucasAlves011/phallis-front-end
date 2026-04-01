import type { NextConfig } from "next";
import path from "path";

// Pega a URL do Backend da variável de ambiente ou usa o padrão localhost
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

// Helper para extrair partes da URL para a config de imagens
const getBackendUrlParts = () => {
  try {
    const url = new URL(BACKEND_URL);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port,
    };
  } catch (e) {
    return { protocol: 'http' as const, hostname: 'localhost', port: '8085' };
  }
};

const urlParts = getBackendUrlParts();

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: urlParts.protocol,
        hostname: urlParts.hostname,
        port: urlParts.port,
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
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
