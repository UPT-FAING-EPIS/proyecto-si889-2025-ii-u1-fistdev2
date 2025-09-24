/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Deshabilitar SWC para evitar problemas en Docker Alpine
  swcMinify: false,
  // appDir is now default in Next.js 14, no need to specify
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'DevFlow',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ]
  },
}

module.exports = nextConfig
