import { Suspense } from 'react';
import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { Footer } from '@/components/Footer';
import { SkiLinksHero } from '@/components/ski-links/SkiLinksHero';
import { SkiLinksContent } from '@/components/ski-links/SkiLinksContent';
import { getSkiLinks, getSkiLinkStats } from '@/lib/mock-data/ski-links';

export const metadata: Metadata = {
  title: 'Skiing Websites & Resources Directory',
  description:
    'Curated links to the best ski websites: resorts, snow reports, webcams, trail maps, lodging, gear reviews, communities, and more. Your one-stop ski resource hub.',
  alternates: {
    canonical: '/ski-links',
  },
  openGraph: {
    title: 'Skiing Websites & Resources Directory | Ski Colorado',
    description:
      'Curated links to the best ski websites: resorts, snow reports, webcams, trail maps, lodging, gear reviews, communities, and more.',
    type: 'website',
  },
};

export default function SkiLinksPage() {
  const links = getSkiLinks();
  const stats = getSkiLinkStats();

  // Count non-empty categories
  const categoryCount = Object.values(stats.byType).filter((count) => count > 0).length;

  return (
    <main className="min-h-screen bg-white">
      <PageWrapper headerVariant="solid" />

      <SkiLinksHero linkCount={stats.total} categoryCount={categoryCount} />

      <div className="container-custom py-8">
        <Suspense
          fallback={
            <div className="h-96 flex items-center justify-center text-gray-500">
              Loading links...
            </div>
          }
        >
          <SkiLinksContent links={links} />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
