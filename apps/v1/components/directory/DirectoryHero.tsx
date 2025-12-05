import { Mountain } from 'lucide-react';
import Link from 'next/link';

interface DirectoryHeroProps {
  resortCount: number;
  totalResorts?: number;
  stateName?: string | null;
  countryName?: string | null;
  stateCode?: string;
  countryCode?: string;
}

export function DirectoryHero({
  resortCount,
  totalResorts,
  stateName,
  countryName,
  stateCode,
  countryCode,
}: DirectoryHeroProps) {
  // Determine the title and description based on filters
  const isFiltered = stateName || countryName;

  const title = stateName
    ? `${stateName} Ski Resorts`
    : countryName
    ? `${countryName} Ski Resorts`
    : 'Resorts';

  const description = stateName
    ? `Explore all ${resortCount} ski resorts in ${stateName}. Sort by snow conditions, terrain, size, or distance to find your perfect mountain.`
    : countryName
    ? `Explore all ${resortCount} ski resorts in ${countryName}. Sort by snow conditions, terrain, size, or distance to find your perfect mountain.`
    : `Compare all ${resortCount} ski resorts at a glance. Sort by snow conditions, terrain, size, or distance to find your perfect mountain.`;

  return (
    <div className="bg-gradient-to-b from-ski-blue/5 to-white border-b border-gray-100">
      <div className="container-custom py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-ski-blue/10 rounded-lg">
            <Mountain className="w-6 h-6 text-ski-blue" />
          </div>
          <nav className="text-sm text-gray-500">
            {/* Breadcrumb pattern: Home / Directory / [Country] / [State] */}
            <Link href="/" className="hover:text-ski-blue transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            {isFiltered ? (
              <>
                <Link href="/directory" className="hover:text-ski-blue transition-colors">
                  Directory
                </Link>
                {/* Country level: Directory / US */}
                {countryName && (
                  <>
                    <span className="mx-2">/</span>
                    {stateName ? (
                      <Link
                        href={`/directory?country=${countryCode}`}
                        className="hover:text-ski-blue transition-colors"
                      >
                        {countryName}
                      </Link>
                    ) : (
                      <span className="text-gray-900">{countryName}</span>
                    )}
                  </>
                )}
                {/* State level: Directory / US / Washington */}
                {stateName && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{stateName}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-gray-900">Directory</span>
            )}
          </nav>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {title}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl">{description}</p>

        {isFiltered && totalResorts && totalResorts !== resortCount && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {resortCount} of {totalResorts} total resorts
          </p>
        )}
      </div>
    </div>
  );
}
