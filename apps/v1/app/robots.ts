import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skicolorado.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          // Prevent indexing of filtered/sorted URLs to avoid duplicate content
          '/*?sort=*',
          '/*?filter=*',
          '/*?q=*',
          '/*?platform=*',
          '/*?topic=*',
          '/*?region=*',
          '/*?type=*',
          '/*?audience=*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
