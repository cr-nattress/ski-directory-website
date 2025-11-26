import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { Hero } from '@/components/Hero';
import { ResortGrid } from '@/components/ResortGrid';
import { ContentSection } from '@/components/ContentSection';
import { Footer } from '@/components/Footer';
import { WebsiteJsonLd } from '@/components/schema';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <WebsiteJsonLd />
      <PageWrapper headerVariant="overlay" />
      <Hero />
      <ResortGrid />
      <ContentSection />
      <Footer />
    </main>
  );
}
