import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
        },
      ],
      unoptimized: process.env.NODE_ENV === 'development',
    },
    // Add static file serving
    async headers() {
      return [
        {
          source: '/fonts/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ]
    },
    async rewrites() {
      return [
        {
          source: '/fonts/:path*',
          destination: '/fonts/:path*',
        },
        // Exclude NextAuth.js routes from being forwarded to the backend
        {
          source: '/api/auth/:path*',
          destination: '/api/auth/:path*',
        },
        // Forward other API routes to the backend
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
        },
      ];
    },
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@shared': '../shared',
      }
      return config
    },
  };
  
  export default nextConfig; 