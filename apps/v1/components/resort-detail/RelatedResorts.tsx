'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Resort } from '@/lib/types';
import { getCardImageUrl, PLACEHOLDER_IMAGE } from '@/lib/utils/resort-images';
import { MapPin, Mountain } from 'lucide-react';
import { trackResortClick } from '@/lib/analytics';

interface RelatedResortsProps {
  currentResort: Resort;
  relatedResorts: Resort[];
  title?: string;
}

export function RelatedResorts({
  currentResort,
  relatedResorts,
  title = 'Related Resorts',
}: RelatedResortsProps) {
  if (relatedResorts.length === 0) return null;

  return (
    <section className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedResorts.slice(0, 6).map((resort) => (
          <Link
            key={resort.id}
            href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
            className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            onClick={() => trackResortClick(resort.name, 'related')}
          >
            <div className="relative h-32 bg-gray-100">
              <Image
                src={getCardImageUrl(resort) || PLACEHOLDER_IMAGE}
                alt={resort.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
              {resort.passAffiliations.length > 0 && (
                <div className="absolute top-2 right-2 flex gap-1">
                  {resort.passAffiliations.slice(0, 2).map((pass) => (
                    <span
                      key={pass}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        pass === 'epic'
                          ? 'bg-epic-red text-white'
                          : pass === 'ikon'
                          ? 'bg-ikon-orange text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {pass}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-ski-blue transition-colors">
                {resort.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {resort.nearestCity}, {resort.stateCode?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Mountain className="w-3.5 h-3.5" />
                <span>{resort.stats.skiableAcres.toLocaleString()} acres</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
