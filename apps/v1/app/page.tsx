import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { Hero } from '@/components/Hero';
import { ResortSection } from '@/components/ResortSection';
import { ContentSection } from '@/components/ContentSection';
import { Footer } from '@/components/Footer';
import { WebsiteJsonLd } from '@/components/schema';
import { FeatureFlag } from '@/components/FeatureFlag';

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
      <ResortSection />
      <FeatureFlag name="contentSection">
        <ContentSection />
      </FeatureFlag>
      <Footer />
    </main>
  );
}
