// File: next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ✅ Dicebear avatar generator untuk user avatars
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/7.x/**', // Support untuk semua style dicebear v7.x
      },
      // ✅ Potential other image sources yang mungkin digunakan
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '**',
      },
      // ✅ Local development dan production domains
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '**',
      },
      // ✅ Vercel deployment domains
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        port: '',
        pathname: '**',
      }
    ],
    // ✅ Alternative: jika ingin menggunakan domains (legacy)
    // domains: [
    //   'api.dicebear.com',
    //   'images.unsplash.com',
    //   'via.placeholder.com'
    // ],
  },
  // ✅ Other Next.js optimizations
  experimental: {
    // Enable modern optimizations
    optimizePackageImports: ['lucide-react'],
  },
  // ✅ Strict mode untuk development
  reactStrictMode: true,
  // ✅ Power by header removal untuk security
  poweredByHeader: false,
};

export default nextConfig;