import type { MetadataRoute } from 'next';
import { getResorts } from '@/lib/services/resort-service';
import { getSkiLinks } from '@/lib/data/ski-links';
import { getSocialLinks } from '@/lib/data/social-links';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skicolorado.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all active resorts from Supabase
  const resorts = await getResorts({ status: 'active' });

  const resortUrls = resorts.map((resort) => ({
    url: `${BASE_URL}/${resort.country || 'us'}/${resort.state}/${resort.slug}`,
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
