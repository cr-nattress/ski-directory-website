/**
 * @module ResortMapView
 * @purpose Interactive Leaflet map showing all ski resorts
 * @context Landing page map view toggle option
 *
 * @pattern Client component with dynamic Leaflet import
 *
 * @sideeffects
 * - Uses useMapPins() hook (network + localStorage)
 * - Programmatic navigation via router.push()
 *
 * @decision
 * Must use dynamic import with ssr: false due to Leaflet's window dependency.
 * Markers colored by primary pass affiliation for quick visual identification.
 */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import { useMapPins } from '@/lib/hooks/useMapPins';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

/** Marker colors indexed by pass type */
const PASS_COLORS = {
  epic: '#dc2626',              // red-600
  ikon: '#f97316',              // orange-500
  indy: '#8b5cf6',              // violet-500
  'mountain-collective': '#059669',  // emerald-600
  'powder-alliance': '#0891b2',      // cyan-600
  'ny-ski3': '#2563eb',              // blue-600
  'rcr-rockies': '#7c3aed',          // violet-600
  'lest-go': '#db2777',              // pink-600
  local: '#3b82f6',             // blue-500
  lost: '#6b7280',              // gray-500
};

/**
 * Create custom Leaflet divIcon marker with pass-type color
 *
 * @param passType - Primary pass affiliation ('epic', 'ikon', etc.)
 * @param isLost - Whether resort is permanently closed
 * @returns Leaflet DivIcon or null if window unavailable
 */
function createMarkerIcon(passType: string, isLost: boolean) {
  if (typeof window === 'undefined') return null;

  const L = require('leaflet');
  const color = isLost
    ? PASS_COLORS.lost
    : PASS_COLORS[passType as keyof typeof PASS_COLORS] || PASS_COLORS.local;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m10 20 4-16m2 14L7.5 6.5"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

/**
 * Interactive map view of all ski resorts
 *
 * Features:
 * - Color-coded markers by pass type
 * - Popup with resort info, rating, status, lift conditions
 * - Click-through to resort detail page
 * - Legend showing pass type colors
 *
 * @remarks
 * Centers on North America (44°N, 98°W) at zoom 4.
 * Popups show Liftie real-time data when available.
 */
export function ResortMapView() {
  const router = useRouter();
  const { pins, isLoading, error } = useMapPins();
  const [mapReady, setMapReady] = useState(false);

  // Memoize marker icons to avoid recreating them on every render
  // Key format: "{passType}:{isLost}" -> Icon
  const markerIcons = useMemo(() => {
    if (typeof window === 'undefined' || !mapReady) return new Map();

    const iconCache = new Map<string, ReturnType<typeof createMarkerIcon>>();
    pins.forEach((pin) => {
      const primaryPass = pin.passAffiliations[0] || 'local';
      const key = `${primaryPass}:${pin.isLost}`;
      if (!iconCache.has(key)) {
        iconCache.set(key, createMarkerIcon(primaryPass, pin.isLost));
      }
    });
    return iconCache;
  }, [pins, mapReady]);

  // Fix Leaflet default icon issue and signal map is ready
  // Note: _getIconUrl is an internal Leaflet property not in TypeScript types.
  // This workaround is documented: https://github.com/Leaflet/Leaflet/issues/4968
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      type LeafletIconPrototype = { _getIconUrl?: string };
      delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;
      setMapReady(true);
    }
  }, []);

  if (isLoading || !mapReady) {
    return (
      <div className="w-full h-[500px] lg:h-[600px] bg-neutral-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-neutral-500">Loading map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[500px] lg:h-[600px] bg-neutral-100 rounded-xl flex items-center justify-center">
        <span className="text-red-500">Failed to load map</span>
      </div>
    );
  }

  // Center on North America to show lower 48 US states + southern Canada
  // Lat 44°N is roughly the US-Canada border in the middle
  // Lng 98°W is central North America
  const center: [number, number] = [44.0, -98.0];

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={4}
        className="w-full h-full"
        scrollWheelZoom={true}
        minZoom={3}
        maxZoom={12}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pins.map((pin) => {
          // Skip pins without valid coordinates
          if (!pin.latitude || !pin.longitude) return null;

          // Use memoized icon from cache
          const primaryPass = pin.passAffiliations[0] || 'local';
          const iconKey = `${primaryPass}:${pin.isLost}`;
          const icon = markerIcons.get(iconKey);

          if (!icon) return null;

          return (
            <Marker
              key={pin.id}
              position={[pin.latitude, pin.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="min-w-[200px] space-y-2 p-1">
                  <h3 className="font-semibold text-base">{pin.name}</h3>
                  <p className="text-sm text-neutral-600">{pin.nearestCity}</p>

                  <div className="flex items-center gap-2 text-sm">
                    {pin.status === 'open' && !pin.isLost && (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                        Open
                      </span>
                    )}
                    {pin.isLost && (
                      <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-xs font-medium">
                        Closed
                      </span>
                    )}
                  </div>

                  {pin.snowfall24h && pin.snowfall24h > 0 && (
                    <p className="text-sm text-sky-600">
                      &#10052; {pin.snowfall24h}&quot; new snow
                    </p>
                  )}

                  {/* Lift conditions from Liftie */}
                  {!pin.isLost && pin.liftsTotal && pin.liftsTotal > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        'font-medium',
                        pin.liftsPercentage && pin.liftsPercentage >= 75 ? 'text-green-600' :
                        pin.liftsPercentage && pin.liftsPercentage >= 25 ? 'text-yellow-600' :
                        'text-red-600'
                      )}>
                        {pin.liftsOpen}/{pin.liftsTotal} lifts
                      </span>
                      {pin.weatherCondition && (
                        <>
                          <span className="text-neutral-300">|</span>
                          <span className="text-neutral-600">
                            {pin.weatherCondition}
                            {pin.weatherHigh !== undefined && ` ${pin.weatherHigh}°F`}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex gap-1 flex-wrap">
                    {pin.passAffiliations.map((pass) => (
                      <span
                        key={pass}
                        className={cn(
                          'text-xs px-2 py-0.5 rounded text-white',
                          pass === 'epic' && 'bg-red-600',
                          pass === 'ikon' && 'bg-orange-500',
                          pass === 'indy' && 'bg-violet-500',
                          pass === 'mountain-collective' && 'bg-emerald-600',
                          pass === 'powder-alliance' && 'bg-cyan-600',
                          pass === 'ny-ski3' && 'bg-blue-600',
                          pass === 'rcr-rockies' && 'bg-violet-600',
                          pass === 'lest-go' && 'bg-pink-600',
                          pass === 'local' && 'bg-neutral-600'
                        )}
                      >
                        {pass === 'mountain-collective' ? 'Mtn Collective' :
                         pass === 'powder-alliance' ? 'Powder Alliance' :
                         pass === 'ny-ski3' ? 'NY SKI3' :
                         pass === 'rcr-rockies' ? 'RCR Rockies' :
                         pass === 'lest-go' ? "L'EST GO" :
                         pass.charAt(0).toUpperCase() + pass.slice(1)}
                      </span>
                    ))}
                    {pin.websiteUrl && (
                      <a
                        href={pin.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-700 transition-colors inline-flex items-center gap-1"
                        style={{ color: 'white' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="2" y1="12" x2="22" y2="12"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        <span style={{ color: 'white' }}>Website</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/${pin.countryCode}/${pin.stateCode}/${pin.slug}`)}
                    className="w-full mt-2 bg-sky-600 text-white text-sm py-2 rounded-lg hover:bg-sky-700 transition-colors font-medium"
                  >
                    View Details &rarr;
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend - hidden on mobile */}
      <div className="hidden md:block absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
        <div className="text-xs font-semibold mb-2 text-neutral-700">Pass Types</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-neutral-600">Epic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-neutral-600">Ikon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-neutral-600">Indy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="text-neutral-600">Mtn Collective</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-600" />
            <span className="text-neutral-600">Powder Alliance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-neutral-600">NY SKI3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-600" />
            <span className="text-neutral-600">RCR Rockies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-600" />
            <span className="text-neutral-600">L&apos;EST GO</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-neutral-600">Local</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-400" />
            <span className="text-neutral-600">Lost</span>
          </div>
        </div>
      </div>
    </div>
  );
}
