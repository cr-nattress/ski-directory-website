import type { MetadataRoute } from 'next';
import { mockResorts } from '@/lib/mock-data';
import { getSkiLinks } from '@/lib/mock-data/ski-links';
import { getSocialLinks } from '@/lib/mock-data/social-links';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skicolorado.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Get all active resorts
  const resortUrls = mockResorts
    .filter((r) => r.isActive)
    .map((resort) => ({
      url: `${BASE_URL}/colorado/${resort.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/directory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ski-links`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/social-links`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  return [...staticPages, ...resortUrls];
}
