/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone' // enables production build for Docker multi-stage
};

module.exports = nextConfig;