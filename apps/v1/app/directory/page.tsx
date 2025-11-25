import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { Footer } from '@/components/Footer';
import { DirectoryContent } from '@/components/directory/DirectoryContent';
import { DirectoryHero } from '@/components/directory/DirectoryHero';
import { mockResorts } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Colorado Ski Resorts A-Z Directory | Ski Colorado',
  description:
    'Compare all Colorado ski resorts at a glance. View real-time snow conditions, terrain open, skiable acres, vertical drop, and pass information for every resort.',
  openGraph: {
    title: 'Colorado Ski Resorts A-Z Directory | Ski Colorado',
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
        <DirectoryContent resorts={resorts} />
      </div>

      <Footer />
    </main>
  );
}
