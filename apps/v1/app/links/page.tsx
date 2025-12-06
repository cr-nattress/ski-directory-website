import { Suspense } from 'react';
import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { SkiLinksHero } from '@/components/ski-links/SkiLinksHero';
import { SkiLinksContent } from '@/components/ski-links/SkiLinksContent';
import { getSkiLinks, getSkiLinkStats } from '@/lib/data/ski-links';

export const metadata: Metadata = {
  title: 'Skiing Websites & Resources Directory',
  description:
    'Curated links to the best ski websites: resorts, snow reports, webcams, trail maps, lodging, gear reviews, communities, and more. Your one-stop ski resource hub.',
  alternates: {
    canonical: '/links',
  },
  openGraph: {
    title: 'Skiing Websites & Resources Directory | Ski Directory',
    description:
      'Curated links to the best ski websites: resorts, snow reports, webcams, trail maps, lodging, gear reviews, communities, and more.',
    type: 'website',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Ski Directory - Skiing Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-default.jpg'],
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

      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Links', href: '/links' },
        ]}
      />

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
