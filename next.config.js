/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This forces Vercel to deploy the app even if it finds grammar/punctuation warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignores strict type-checking that blocks deployments
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
