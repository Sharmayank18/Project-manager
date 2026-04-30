/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is stable in Next.js 14
  env: {
    PORT: process.env.PORT || 3000,
  },
}

module.exports = nextConfig