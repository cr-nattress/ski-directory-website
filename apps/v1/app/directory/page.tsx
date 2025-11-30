import { Suspense } from 'react';
import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { Footer } from '@/components/Footer';
import { DirectoryContent } from '@/components/directory/DirectoryContent';
import { DirectoryHero } from '@/components/directory/DirectoryHero';
import { resortService } from '@/lib/api/resort-service';

export const metadata: Metadata = {
  title: 'Ski Resorts A-Z Directory',
  description:
    'Compare all ski resorts at a glance. View real-time snow conditions, terrain open, skiable acres, vertical drop, and pass information for every resort.',
  alternates: {
    canonical: '/directory',
  },
  openGraph: {
    title: 'Ski Resorts A-Z Directory | Ski Directory',
    description:
      'Compare all ski resorts at a glance. View real-time snow conditions, terrain open, skiable acres, vertical drop, and pass information.',
    type: 'website',
  },
};

async function DirectoryPageContent() {
  // Get all active resorts from Supabase
  const response = await resortService.getAllResorts();
  const resorts = response.data.filter((r) => r.isActive);

  return (
    <>
      <DirectoryHero resortCount={resorts.length} />

      <div className="container-custom py-8">
        <DirectoryContent resorts={resorts} />
      </div>
    </>
  );
}

export default function DirectoryPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageWrapper headerVariant="solid" />

      <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-500">Loading directory...</div>}>
        <DirectoryPageContent />
      </Suspense>

      <Footer />
    </main>
  );
}
