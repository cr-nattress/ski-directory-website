import { Suspense } from 'react';
import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { Footer } from '@/components/Footer';
import { SocialLinksHero } from '@/components/social-links/SocialLinksHero';
import { SocialLinksContent } from '@/components/social-links/SocialLinksContent';
import { getSocialLinks, getUniquePlatformCount } from '@/lib/mock-data/social-links';

export const metadata: Metadata = {
  title: 'Ski Social Media Directory | YouTube, Instagram, TikTok & More',
  description:
    'Discover the best ski YouTube channels, Instagram accounts, TikTok creators, Reddit communities, and Discord servers. Curated social media for skiers of all levels.',
  alternates: {
    canonical: '/social-links',
  },
  openGraph: {
    title: 'Ski Social Media Directory | YouTube, Instagram, TikTok & More',
    description:
      'Discover the best ski YouTube channels, Instagram accounts, TikTok creators, and communities. Curated social media for skiers.',
    type: 'website',
  },
};

export default function SocialLinksPage() {
  const links = getSocialLinks();
  const platformCount = getUniquePlatformCount();

  return (
    <main className="min-h-screen bg-white">
      <PageWrapper headerVariant="solid" />

      <SocialLinksHero channelCount={links.length} platformCount={platformCount} />

      <div className="container-custom py-8">
        <Suspense
          fallback={
            <div className="h-96 flex items-center justify-center text-gray-500">
              Loading channels...
            </div>
          }
        >
          <SocialLinksContent links={links} />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
