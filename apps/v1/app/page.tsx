import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ResortGrid } from '@/components/ResortGrid';
import { ContentSection } from '@/components/ContentSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header variant="solid" />
      <Hero />
      <ResortGrid />
      <ContentSection />
      <Footer />
    </main>
  );
}
