import type { Resort } from '@/lib/types';
import { MapPin, Navigation } from 'lucide-react';

interface LocationCardProps {
  resort: Resort;
}

export function LocationCard({ resort }: LocationCardProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${resort.location.lat},${resort.location.lng}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Location</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-ski-blue flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{resort.nearestCity}</p>
              <p className="text-sm text-gray-600">
                {resort.distanceFromMajorCity} miles from {resort.majorCityName}
              </p>
              <p className="text-sm text-gray-600">
                {resort.driveTimeToMajorCity} minute drive
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-ski-blue text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </a>
          </div>

          <div className="text-xs text-gray-500">
            <p>Coordinates: {resort.location.lat.toFixed(4)}, {resort.location.lng.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
