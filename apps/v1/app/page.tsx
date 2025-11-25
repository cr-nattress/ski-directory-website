import { PageWrapper } from '@/components/PageWrapper';
import { Hero } from '@/components/Hero';
import { ResortGrid } from '@/components/ResortGrid';
import { ContentSection } from '@/components/ContentSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <PageWrapper headerVariant="overlay" />
      <Hero />
      <ResortGrid />
      <ContentSection />
      <Footer />
    </main>
  );
}
