/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // enables the lightweight Docker build below
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

module.exports = nextConfig;
