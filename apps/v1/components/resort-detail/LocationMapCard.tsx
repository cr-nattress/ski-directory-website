'use client';

import type { Resort } from '@/lib/types';
import type { SkiShop } from '@/lib/types/ski-shop';
import { formatPhone, getTelLink, getShopTypeLabel } from '@/lib/types/ski-shop';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';
import type { Icon, LatLngBounds } from 'leaflet';
import { Globe, Phone } from 'lucide-react';

interface LocationMapCardProps {
  resort: Resort;
  skiShops?: SkiShop[];
  /** When true, card fills parent height (for hero alignment) */
  fillHeight?: boolean;
}

/**
 * Component to fit map bounds to include all markers
 */
function FitBounds({ bounds }: { bounds: LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [map, bounds]);

  return null;
}

export function LocationMapCard({ resort, skiShops = [], fillHeight = false }: LocationMapCardProps) {
  const [resortIcon, setResortIcon] = useState<Icon | null>(null);
  const [shopIcon, setShopIcon] = useState<Icon | null>(null);

  // Filter ski shops with valid coordinates
  const shopsWithCoords = useMemo(() =>
    skiShops.filter((shop) => shop.latitude && shop.longitude),
    [skiShops]
  );

  // Calculate bounds to fit all markers
  const bounds = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const L = require('leaflet');
    const allPoints: [number, number][] = [
      [resort.location.lat, resort.location.lng]
    ];

    shopsWithCoords.forEach((shop) => {
      allPoints.push([shop.latitude, shop.longitude]);
    });

    if (allPoints.length === 1) {
      // Only resort marker, no need for bounds fitting
      return null;
    }

    return L.latLngBounds(allPoints) as LatLngBounds;
  }, [resort.location.lat, resort.location.lng, shopsWithCoords]);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const L = require('leaflet');

      // Fix for default marker icon in Leaflet with Next.js
      // Note: _getIconUrl is an internal Leaflet property not in TypeScript types.
      // This workaround is documented: https://github.com/Leaflet/Leaflet/issues/4968
      type LeafletIconPrototype = { _getIconUrl?: string };
      delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;

      // Resort marker (blue)
      const resortMarker = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Ski shop marker (orange/gold) using divIcon for custom styling
      const shopMarker = L.divIcon({
        html: `<div style="
          background-color: #f59e0b;
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        className: 'ski-shop-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
      });

      setResortIcon(resortMarker);
      setShopIcon(shopMarker);
    }
  }, []);

  if (!resortIcon) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-md p-6 ${fillHeight ? 'h-full flex flex-col' : ''}`}>
        <h3 className="text-lg font-semibold mb-2">Location</h3>
        <div className={`${fillHeight ? 'flex-1' : 'h-[300px]'} w-full bg-gray-100 rounded-lg flex items-center justify-center`}>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden ${fillHeight ? 'h-full flex flex-col' : ''}`}>
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Location</h3>
            <p className="text-sm text-gray-600">{resort.nearestCity}</p>
          </div>
          {shopsWithCoords.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                Ski Shops ({shopsWithCoords.length})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`${fillHeight ? 'flex-1 min-h-0' : 'h-[300px]'} w-full`}>
        <MapContainer
          center={[resort.location.lat, resort.location.lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Fit bounds to show all markers */}
          <FitBounds bounds={bounds} />

          {/* Resort marker */}
          <Marker
            position={[resort.location.lat, resort.location.lng]}
            icon={resortIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{resort.name}</p>
                <p className="text-sm text-gray-600">{resort.nearestCity}</p>
              </div>
            </Popup>
          </Marker>

          {/* Ski shop markers */}
          {shopIcon && shopsWithCoords.map((shop) => (
            <Marker
              key={shop.id}
              position={[shop.latitude, shop.longitude]}
              icon={shopIcon}
            >
              <Popup>
                <SkiShopPopup shop={shop} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer - hide when fillHeight to maximize map area */}
      {!fillHeight && (
        <div className="p-6 pt-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Distance from {resort.majorCityName}</span>
            <span className="font-semibold">{resort.distanceFromMajorCity} miles • {resort.driveTimeToMajorCity} min</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Popup content for ski shop markers
 */
function SkiShopPopup({ shop }: { shop: SkiShop }) {
  const formattedPhone = formatPhone(shop.phone);
  const telLink = getTelLink(shop.phone);
  const services = shop.shop_type.map(getShopTypeLabel).join(' • ');

  return (
    <div className="min-w-[180px] max-w-[220px]">
      {/* Shop name */}
      <p className="font-semibold text-gray-900 text-sm mb-1">{shop.name}</p>

      {/* Services */}
      <p className="text-xs text-gray-600 mb-2">{services}</p>

      {/* Phone */}
      {formattedPhone && telLink && (
        <a
          href={telLink}
          className="flex items-center gap-1.5 text-xs text-ski-blue hover:underline mb-1.5"
        >
          <Phone className="w-3 h-3" />
          {formattedPhone}
        </a>
      )}

      {/* Website */}
      {shop.website_url && (
        <a
          href={shop.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-ski-blue hover:underline"
        >
          <Globe className="w-3 h-3" />
          Visit Website
        </a>
      )}
    </div>
  );
}
