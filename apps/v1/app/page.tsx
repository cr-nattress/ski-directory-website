import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { Hero } from '@/components/Hero';
import { ResortSection } from '@/components/ResortSection';
import { IntelligentResortSection } from '@/components/IntelligentResortSection';
import { ContentSection } from '@/components/ContentSection';
import { Footer } from '@/components/Footer';
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/schema';
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
      <OrganizationJsonLd />
      <PageWrapper headerVariant="overlay" />
      <Hero />
      <FeatureFlag name="intelligentListing" fallback={<ResortSection />}>
        <IntelligentResortSection />
      </FeatureFlag>
      <FeatureFlag name="contentSection">
        <ContentSection />
      </FeatureFlag>
      <Footer />
    </main>
  );
}
