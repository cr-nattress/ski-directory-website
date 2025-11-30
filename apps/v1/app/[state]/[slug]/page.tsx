import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getResortBySlug } from '@/lib/services/resort-service';
import { supabase } from '@/lib/supabase';
import { ResortDetail } from '@/components/resort-detail/ResortDetail';
import { adaptResortFromSupabase } from '@/lib/api/supabase-resort-adapter';

// ISR: Regenerate pages every hour for fresh snow conditions
export const revalidate = 3600;
export const dynamicParams = true;

interface ResortPageProps {
  params: {
    state: string;
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ResortPageProps): Promise<Metadata> {
  const resortData = await getResortBySlug(params.slug);

  if (!resortData) {
    return {
      title: 'Resort Not Found',
    };
  }

  const stateName = resortData.state_name || params.state;
  const skiableAcres = resortData.stats?.skiableAcres || 0;
  const verticalDrop = resortData.stats?.verticalDrop || 0;
  const runsCount = resortData.stats?.runsCount || 0;

  const description = `${resortData.name} ski resort in ${resortData.nearest_city || stateName}. ${skiableAcres.toLocaleString()} skiable acres, ${verticalDrop.toLocaleString()}' vertical drop, ${runsCount} runs. Current conditions and trail maps.`;

  return {
    title: `${resortData.name} Ski Resort`,
    description,
    alternates: {
      canonical: `/${params.state}/${params.slug}`,
    },
    openGraph: {
      title: `${resortData.name} | ${stateName} Ski Resort`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${resortData.name} | ${stateName} Ski Resort`,
      description,
    },
  };
}

// Generate static paths for all resorts at build time
export async function generateStaticParams() {
  // Fetch all resorts with state and slug for static generation
  const { data, error } = await supabase
    .from('resorts')
    .select('slug, state_slug')
    .order('slug');

  if (error) {
    console.error('Error fetching resort slugs:', error);
    return [];
  }

  // Return array of { state, slug } params
  return (data || []).map((item) => ({
    state: item.state_slug,
    slug: item.slug,
  }));
}

export default async function ResortPage({ params }: ResortPageProps) {
  const resortData = await getResortBySlug(params.slug);

  if (!resortData) {
    notFound();
  }

  // Verify the state matches (for canonical URLs)
  if (resortData.state !== params.state) {
    notFound();
  }

  // Adapt Supabase data to the Resort type expected by ResortDetail
  const resort = adaptResortFromSupabase(resortData);

  return <ResortDetail resort={resort} />;
}
