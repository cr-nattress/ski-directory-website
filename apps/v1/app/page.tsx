/**
 * @module LandingPage
 * @purpose Main entry point / home page for the ski resort directory
 * @context Root route (/)
 *
 * @pattern Server component with client component children
 *
 * @exports
 * - metadata: SEO metadata with canonical URL
 * - Home: Page component
 *
 * @decision
 * Use feature flags to conditionally render:
 * - intelligentListing: AI-ranked resort sections vs basic ResortSection
 * - contentSection: Editorial content (disabled by default)
 */
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
