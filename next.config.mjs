/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // allows production build even if there are TS errors
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
