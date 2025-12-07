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

import { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import { useMapPins } from '@shared/api';
import { cn } from '@/lib/utils';
import { Navigation, Loader2, X, ChevronUp, ChevronDown } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const MAP_GESTURE_HINT_KEY = 'ski-directory-map-gesture-hint-shown';

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
 * Larger size (40px) for better touch target on mobile
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
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        border: 3px solid white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m10 20 4-16m2 14L7.5 6.5"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

/**
 * Locate Me floating action button component
 */
function LocateMeButton() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 8);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
      }
    );
  }, [map]);

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      className={cn(
        'absolute bottom-4 right-4 z-[1000]',
        'w-12 h-12 rounded-full bg-white shadow-lg',
        'flex items-center justify-center',
        'hover:bg-gray-50 active:bg-gray-100',
        'transition-colors'
      )}
      aria-label="Find my location"
    >
      {isLocating ? (
        <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
      ) : (
        <Navigation className="w-5 h-5 text-sky-600" />
      )}
    </button>
  );
}

/**
 * Gesture hint overlay for first-time touch users
 */
function MapGestureHint() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Only show on touch devices, first visit
    const isTouchDevice = 'ontouchstart' in window;
    const hasSeenHint = localStorage.getItem(MAP_GESTURE_HINT_KEY);

    if (isTouchDevice && !hasSeenHint) {
      setShowHint(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem(MAP_GESTURE_HINT_KEY, 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    localStorage.setItem(MAP_GESTURE_HINT_KEY, 'true');
  }, []);

  if (!showHint) return null;

  return (
    <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-xl px-6 py-4 shadow-xl text-center max-w-[200px]">
        <button
          onClick={dismissHint}
          className="absolute top-2 right-2 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
        <div className="text-4xl mb-2">👆👆</div>
        <p className="text-sm text-gray-700">
          Use two fingers to zoom and pan the map
        </p>
      </div>
    </div>
  );
}

/**
 * Collapsible map legend component
 * Collapsed by default on mobile, expanded on desktop
 */
function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    { color: 'bg-red-600', label: 'Epic' },
    { color: 'bg-orange-500', label: 'Ikon' },
    { color: 'bg-violet-500', label: 'Indy' },
    { color: 'bg-emerald-600', label: 'Mtn Collective' },
    { color: 'bg-cyan-600', label: 'Powder Alliance' },
    { color: 'bg-blue-600', label: 'NY SKI3' },
    { color: 'bg-violet-600', label: 'RCR Rockies' },
    { color: 'bg-pink-600', label: "L'EST GO" },
    { color: 'bg-blue-500', label: 'Local' },
    { color: 'bg-neutral-400', label: 'Lost' },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg z-[1000]">
      {/* Mobile: Collapsed by default with toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden flex items-center gap-2 px-3 py-2 min-h-[44px] w-full"
        aria-expanded={isExpanded}
      >
        <span className="text-xs font-semibold text-neutral-700">Legend</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        )}
      </button>

      {/* Legend content */}
      <div
        className={cn(
          'px-3 pb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs',
          // Desktop: always visible with top padding
          'md:pt-3',
          // Mobile: collapsible
          !isExpanded && 'hidden md:grid'
        )}
      >
        <div className="col-span-2 text-xs font-semibold mb-1 text-neutral-700 hidden md:block">
          Pass Types
        </div>
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', item.color)} />
            <span className="text-neutral-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
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
      {/* Gesture hint for first-time touch users */}
      <MapGestureHint />

      <MapContainer
        center={center}
        zoom={4}
        className="w-full h-full"
        scrollWheelZoom={false}
        minZoom={3}
        maxZoom={12}
        touchZoom={true}
        dragging={true}
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

        {/* Locate Me button */}
        <LocateMeButton />
      </MapContainer>

      {/* Map Legend - collapsible on mobile, always expanded on desktop */}
      <MapLegend />
    </div>
  );
}
