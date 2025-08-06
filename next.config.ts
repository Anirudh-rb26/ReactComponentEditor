// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 👇 Completely skip ESLint checks during `next build`
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // you're already doing this
  },
}

module.exports = nextConfig
