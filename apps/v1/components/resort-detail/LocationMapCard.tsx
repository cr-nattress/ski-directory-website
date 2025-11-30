'use client';

import type { Resort } from '@/lib/types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

interface LocationMapCardProps {
  resort: Resort;
}

export function LocationMapCard({ resort }: LocationMapCardProps) {
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const L = require('leaflet');

      // Fix for default marker icon in Leaflet with Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      setIcon(customIcon);
    }
  }, []);

  if (!icon) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-2">Location</h3>
        <div className="h-[300px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold mb-2">Location</h3>
        <p className="text-sm text-gray-600">{resort.nearestCity}</p>
      </div>

      <div className="h-[300px] w-full">
        <MapContainer
          center={[resort.location.lat, resort.location.lng]}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[resort.location.lat, resort.location.lng]}
            icon={icon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{resort.name}</p>
                <p className="text-sm text-gray-600">{resort.nearestCity}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="p-6 pt-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Distance from {resort.majorCityName}</span>
          <span className="font-semibold">{resort.distanceFromMajorCity} miles • {resort.driveTimeToMajorCity} min</span>
        </div>
      </div>
    </div>
  );
}
