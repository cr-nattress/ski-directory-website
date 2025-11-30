import { Resort } from '@/lib/types';
import { Map, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface TrailMapCardProps {
  resort: Resort;
}

export function TrailMapCard({ resort }: TrailMapCardProps) {
  if (!resort.trailMapUrl) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Map className="w-5 h-5 text-ski-blue" />
            Trail Map
          </h3>
          <a
            href={resort.trailMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ski-blue hover:text-blue-700 transition-colors text-sm flex items-center gap-1"
          >
            <span>View Full Size</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <p className="text-sm text-gray-600">Explore the terrain at {resort.name}</p>
      </div>

      <div className="relative w-full h-[400px] bg-gray-100">
        <Image
          src={resort.trailMapUrl}
          alt={`${resort.name} Trail Map`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-6 pt-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-600 mb-1">Total Runs</p>
            <p className="font-semibold text-lg">{resort.stats.runsCount}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Lifts</p>
            <p className="font-semibold text-lg">{resort.stats.liftsCount}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Skiable Acres</p>
            <p className="font-semibold text-lg">{resort.stats.skiableAcres.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
