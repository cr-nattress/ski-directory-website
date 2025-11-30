import { Suspense } from 'react';
import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { Footer } from '@/components/Footer';
import { DirectoryContent } from '@/components/directory/DirectoryContent';
import { DirectoryHero } from '@/components/directory/DirectoryHero';
import { mockResorts } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Colorado Ski Resorts A-Z Directory',
  description:
    'Compare all Colorado ski resorts at a glance. View real-time snow conditions, terrain open, skiable acres, vertical drop, and pass information for every resort.',
  alternates: {
    canonical: '/directory',
  },
  openGraph: {
    title: 'Colorado Ski Resorts A-Z Directory | Ski Directory',
    description:
      'Compare all Colorado ski resorts at a glance. View real-time snow conditions, terrain open, skiable acres, vertical drop, and pass information.',
    type: 'website',
  },
};

export default function DirectoryPage() {
  // Get all active resorts
  const resorts = mockResorts.filter((r) => r.isActive);

  return (
    <main className="min-h-screen bg-white">
      <PageWrapper headerVariant="solid" />

      <DirectoryHero resortCount={resorts.length} />

      <div className="container-custom py-8">
        <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-500">Loading directory...</div>}>
          <DirectoryContent resorts={resorts} />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
