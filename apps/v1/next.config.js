/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly expose NEXT_PUBLIC_ env vars to the client bundle
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_USE_SUPABASE: process.env.NEXT_PUBLIC_USE_SUPABASE,
  },
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
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/sda-assets-prod/**',
      },
      {
        protocol: 'https',
        hostname: 'unpkg.com',
      },
    ],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache images for 31 days
    minimumCacheTTL: 2678400,
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self, inline for Next.js, eval for dev, Google Analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              // Styles: self, inline for Tailwind
              "style-src 'self' 'unsafe-inline'",
              // Images: self, data URIs, and approved domains (including Google Analytics)
              "img-src 'self' data: blob: https://storage.googleapis.com https://images.unsplash.com https://source.unsplash.com https://picsum.photos https://unpkg.com https://*.tile.openstreetmap.org https://www.google-analytics.com https://www.googletagmanager.com",
              // Fonts: self and common CDNs
              "font-src 'self' https://fonts.gstatic.com",
              // Connect: API endpoints (including Google Analytics)
              "connect-src 'self' https://*.supabase.co https://*.grafana.net https://liftie.info wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com",
              // Frame ancestors: none (no iframes)
              "frame-ancestors 'none'",
              // Base URI
              "base-uri 'self'",
              // Form actions
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
