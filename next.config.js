/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "rqcoa3ubmzn9qpsj.public.blob.vercel-storage.com",
      },
      {
        hostname: "example.com",
      },
      {
        hostname: "logo.clearbit.com",
      },
      {
        hostname: "via.placeholder.com",
      },
      {
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
  },
  // Empty turbopack config to silence the error
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Mock Redis and other server-side dependencies in client builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "ioredis": false,
        "bullmq": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
