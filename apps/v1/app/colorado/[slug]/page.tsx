import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getResortBySlug } from '@/lib/mock-data';
import { ResortDetail } from '@/components/resort-detail/ResortDetail';

// ISR: Regenerate pages every hour for fresh snow conditions
export const revalidate = 3600;
export const dynamicParams = true;

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
      title: 'Resort Not Found',
    };
  }

  const description = `${resort.name} ski resort in ${resort.nearestCity}, Colorado. ${resort.stats.skiableAcres.toLocaleString()} skiable acres, ${resort.stats.verticalDrop.toLocaleString()}' vertical drop, ${resort.stats.runsCount} runs. Current conditions and trail maps.`;

  return {
    title: `${resort.name} Ski Resort`,
    description,
    alternates: {
      canonical: `/colorado/${params.slug}`,
    },
    openGraph: {
      title: `${resort.name} | Colorado Ski Resort`,
      description: resort.tagline || description,
      images: [resort.heroImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${resort.name} | Colorado Ski Resort`,
      description: resort.tagline || description,
      images: [resort.heroImage],
    },
  };
}

// Generate static paths for all resorts at build time
export async function generateStaticParams() {
  const { mockResorts } = await import('@/lib/mock-data');

  return mockResorts
    .filter((resort) => resort.isActive)
    .map((resort) => ({
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
