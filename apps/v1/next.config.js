/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache images for 31 days
    minimumCacheTTL: 2678400,
  },
};

module.exports = nextConfig;
