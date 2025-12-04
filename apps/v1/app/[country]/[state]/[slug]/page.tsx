import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getResortBySlug } from '@/lib/services/resort-service';
import { supabase } from '@/lib/supabase';
import { ResortDetail } from '@/components/resort-detail/ResortDetail';
import { adaptResortFromSupabase } from '@/lib/api/supabase-resort-adapter';
import { getHeroImageUrl } from '@/lib/supabase';

// ISR: Regenerate pages every hour for fresh snow conditions
export const revalidate = 3600;
export const dynamicParams = true;

interface ResortPageProps {
  params: {
    country: string;
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
  const liftsCount = resortData.stats?.liftsCount || 0;
  const nearestCity = resortData.nearest_city || '';
  const passAffiliations = resortData.pass_affiliations || [];

  // Build a more comprehensive, keyword-rich description
  const descriptionParts = [
    `${resortData.name} ski resort`,
    nearestCity ? `near ${nearestCity}, ${stateName}` : `in ${stateName}`,
  ];

  if (skiableAcres > 0) {
    descriptionParts.push(`offers ${skiableAcres.toLocaleString()} skiable acres`);
  }
  if (runsCount > 0) {
    descriptionParts.push(`${runsCount} runs`);
  }
  if (verticalDrop > 0) {
    descriptionParts.push(`${verticalDrop.toLocaleString()}ft vertical drop`);
  }
  if (passAffiliations.length > 0) {
    const passes = passAffiliations.map((p: string) => {
      switch (p) {
        case 'epic': return 'Epic Pass';
        case 'ikon': return 'Ikon Pass';
        default: return p.charAt(0).toUpperCase() + p.slice(1);
      }
    }).join(', ');
    descriptionParts.push(`Accepts ${passes}`);
  }

  const description = descriptionParts.join('. ') + '.';

  // Generate keywords
  const keywords = [
    resortData.name,
    `${resortData.name} ski resort`,
    `${resortData.name} skiing`,
    `skiing ${nearestCity}`,
    `ski resorts ${stateName}`,
    `${stateName} skiing`,
    nearestCity,
    ...passAffiliations.map((p: string) => `${p} pass resorts`),
  ].filter(Boolean);

  // Get hero image URL for OG image
  const heroImageUrl = resortData.asset_path
    ? getHeroImageUrl(resortData.asset_path)
    : '/images/og-default.jpg';

  // Build geo meta tags
  const lat = resortData.latitude;
  const lng = resortData.longitude;
  const stateCode = resortData.state_slug?.toUpperCase() || params.state.toUpperCase();

  return {
    title: `${resortData.name} | ${skiableAcres.toLocaleString()} Acres | ${nearestCity || stateName}`,
    description,
    keywords,
    alternates: {
      canonical: `/${params.country}/${params.state}/${params.slug}`,
    },
    openGraph: {
      title: `${resortData.name} Ski Resort`,
      description,
      type: 'website',
      url: `https://skidirectory.org/${params.country}/${params.state}/${params.slug}`,
      siteName: 'Ski Directory',
      locale: 'en_US',
      images: [
        {
          url: heroImageUrl,
          width: 1200,
          height: 630,
          alt: `${resortData.name} ski resort`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${resortData.name} Ski Resort`,
      description,
      images: [heroImageUrl],
    },
    other: {
      'geo.region': `US-${stateCode}`,
      'geo.placename': nearestCity || stateName,
      ...(lat && lng ? {
        'geo.position': `${lat};${lng}`,
        'ICBM': `${lat}, ${lng}`,
      } : {}),
    },
  };
}

// Generate static paths for all resorts at build time
export async function generateStaticParams() {
  // Fetch all resorts with country, state, and slug for static generation
  const { data, error } = await supabase
    .from('resorts')
    .select('slug, state_slug, country_code')
    .order('slug');

  if (error) {
    console.error('Error fetching resort slugs:', error);
    return [];
  }

  // Return array of { country, state, slug } params
  type ResortSlugRow = { slug: string; state_slug: string; country_code: string };
  return ((data || []) as ResortSlugRow[]).map((item) => ({
    country: item.country_code,
    state: item.state_slug,
    slug: item.slug,
  }));
}

export default async function ResortPage({ params }: ResortPageProps) {
  const resortData = await getResortBySlug(params.slug);

  if (!resortData) {
    notFound();
  }

  // Verify the country and state match (for canonical URLs)
  if (resortData.country !== params.country || resortData.state !== params.state) {
    notFound();
  }

  // Adapt Supabase data to the Resort type expected by ResortDetail
  const resort = adaptResortFromSupabase(resortData);

  return <ResortDetail resort={resort} />;
}
