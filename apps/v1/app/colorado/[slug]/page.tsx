import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getResortBySlug } from '@/lib/mock-data';
import { ResortDetail } from '@/components/resort-detail/ResortDetail';

interface ResortPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ResortPageProps): Promise<Metadata> {
  const resort = getResortBySlug(params.slug);

  if (!resort) {
    return {
      title: 'Resort Not Found - Colorado Ski Directory',
    };
  }

  return {
    title: `${resort.name} - Colorado Ski Directory`,
    description: resort.description,
    openGraph: {
      title: resort.name,
      description: resort.tagline || resort.description,
      images: [resort.heroImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: resort.name,
      description: resort.tagline || resort.description,
      images: [resort.heroImage],
    },
  };
}

// Generate static paths for all resorts at build time
export async function generateStaticParams() {
  const { mockResorts } = await import('@/lib/mock-data');

  return mockResorts.map((resort) => ({
    slug: resort.slug,
  }));
}

export default function ResortPage({ params }: ResortPageProps) {
  const resort = getResortBySlug(params.slug);

  if (!resort) {
    notFound();
  }

  return <ResortDetail resort={resort} />;
}
