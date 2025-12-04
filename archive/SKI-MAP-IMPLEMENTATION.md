❄️ Interactive Ski Resort Map — README.md
Next.js + React + MapboxGL (or MapLibre) Implementation Guide

Click a state or province → map zooms in.
Click a resort pin → popover → navigate to resort detail page.

📐 Overview

This document describes how to build an interactive map for ski resorts using:

Next.js 13/14 App Router

React

Mapbox GL via react-map-gl

(Optional) MapLibre for open-source alternative

The map supports:

Resort pins with popovers

State & province polygon layers

Click-to-zoom region selection

Navigation to individual ski resort pages

This README serves as your implementation blueprint.

🗺️ Features
✔ Resort Pins

Each resort marker is clickable

Shows popover with quick info

“View Details” button links to its own page

✔ Region-Level Zoom

User clicks a US state or Canadian province

Map smoothly zooms to its bounding box

✔ Next.js Navigation

/resorts/[slug] page shows full resort info

Map → popover → detail page

✔ Clean Component Architecture

SkiMap handles: map, markers, polygons, popovers

skiResorts.ts centralizes resort data

GeoJSON stored in /public/geojson/

🧩 Installation
npm install react-map-gl mapbox-gl @turf/bbox
# or
yarn add react-map-gl mapbox-gl @turf/bbox


Add token:

NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=YOUR_TOKEN_HERE

🏔️ Ski Resort Data Model (lib/skiResorts.ts)
// lib/skiResorts.ts
export type SkiResort = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  stateOrProvince: string;
  country: "US" | "CA";
  elevationFt?: number;
  verticalDropFt?: number;
  totalRuns?: number;
};

export const skiResorts: SkiResort[] = [
  {
    id: "vail",
    name: "Vail Ski Resort",
    slug: "vail-ski-resort",
    latitude: 39.6061,
    longitude: -106.3550,
    stateOrProvince: "Colorado",
    country: "US",
    elevationFt: 11570,
    verticalDropFt: 3450,
    totalRuns: 195,
  },
  {
    id: "crested-butte",
    name: "Crested Butte",
    slug: "crested-butte",
    latitude: 38.8990,
    longitude: -106.9650,
    stateOrProvince: "Colorado",
    country: "US",
  },
  {
    id: "whistler",
    name: "Whistler Blackcomb",
    slug: "whistler-blackcomb",
    latitude: 50.1150,
    longitude: -122.9480,
    stateOrProvince: "British Columbia",
    country: "CA",
  },
];

🌎 GeoJSON Requirements

Place these files under:

public/geojson/us_states.json
public/geojson/ca_provinces.json


Each must follow the structure:

{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Colorado" },
      "geometry": { "type": "Polygon", "coordinates": [ ... ] }
    }
  ]
}


Free sources you can use:

https://eric.clst.org/tech/usgeojson/

https://github.com/codeforamerica/click_that_hood

🧭 Map Component (components/SkiMap.tsx)
"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Map, {
  MapRef,
  Source,
  Layer,
  Marker,
  Popup,
} from "react-map-gl";
import { useState, useRef, useMemo } from "react";
import bbox from "@turf/bbox";
import { skiResorts, SkiResort } from "@/lib/skiResorts";
import { useRouter } from "next/navigation";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export function SkiMap() {
  const router = useRouter();
  const mapRef = useRef<MapRef | null>(null);
  const [selectedResort, setSelectedResort] = useState<SkiResort | null>(null);

  const usStates = require("@/public/geojson/us_states.json");
  const caProvinces = require("@/public/geojson/ca_provinces.json");

  const combinedRegions = useMemo(
    () => ({
      type: "FeatureCollection",
      features: [...usStates.features, ...caProvinces.features],
    }),
    []
  );

  function zoomToRegion(feature) {
    const [minX, minY, maxX, maxY] = bbox(feature);
    mapRef.current?.fitBounds(
      [
        [minX, minY],
        [maxX, maxY],
      ],
      { padding: 40, duration: 800 }
    );
  }

  return (
    <div className="w-full h-[600px] overflow-hidden rounded-xl border">
      <Map
        ref={mapRef}
        initialViewState={{ latitude: 45, longitude: -100, zoom: 3 }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={["region-fill"]}
        onClick={(e) => {
          const hit = e.features?.[0];
          if (hit?.layer.id === "region-fill") return zoomToRegion(hit);
          setSelectedResort(null);
        }}
      >
        <Source id="regions" type="geojson" data={combinedRegions}>
          <Layer
            id="region-fill"
            type="fill"
            paint={{ "fill-color": "#0aa", "fill-opacity": 0.1 }}
          />
        </Source>

        {skiResorts.map((resort) => (
          <Marker
            key={resort.id}
            longitude={resort.longitude}
            latitude={resort.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedResort(resort);
            }}
          >
            <button className="bg-blue-600 text-white rounded-full px-2 py-1 shadow">
              ⛷
            </button>
          </Marker>
        ))}

        {selectedResort && (
          <Popup
            longitude={selectedResort.longitude}
            latitude={selectedResort.latitude}
            anchor="top"
            onClose={() => setSelectedResort(null)}
            closeOnClick={false}
          >
            <div className="space-y-1">
              <div className="font-semibold">{selectedResort.name}</div>
              <div className="text-xs text-neutral-600">
                {selectedResort.stateOrProvince}, {selectedResort.country}
              </div>
              <button
                className="w-full mt-1 bg-blue-600 text-white text-xs py-1 rounded"
                onClick={() => router.push(`/resorts/${selectedResort.slug}`)}
              >
                View details →
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

🔗 Next.js Resort Page (app/resorts/[slug]/page.tsx)
import { skiResorts } from "@/lib/skiResorts";
import { notFound } from "next/navigation";

export default function ResortPage({ params }) {
  const resort = skiResorts.find((r) => r.slug === params.slug);
  if (!resort) return notFound();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{resort.name}</h1>
      <p className="text-neutral-600">
        {resort.stateOrProvince}, {resort.country}
      </p>
      <section className="space-y-2">
        {resort.elevationFt && <div>Elevation: {resort.elevationFt} ft</div>}
        {resort.verticalDropFt && (
          <div>Vertical: {resort.verticalDropFt} ft</div>
        )}
        {resort.totalRuns && <div>Runs: {resort.totalRuns}</div>}
      </section>
    </main>
  );
}

🌐 Use the Map on Your Homepage (app/page.tsx)
import { SkiMap } from "@/components/SkiMap";

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ski Destinations Map</h1>
      <p className="text-sm text-neutral-600">
        Click a state/province to zoom. Click a resort pin for details.
      </p>
      <SkiMap />
    </main>
  );
}

⚙️ Future Enhancements

Resort clustering for dense regions

Hover highlight on states/provinces

Pass-type filtering (Epic / Ikon / Indy / Local)

SSR or SSG with Supabase or Ski Directory API

Snow report overlays

Weather alerts or avalanche conditions

🏁 Completion Checklist
Task	Status
Install Mapbox & Turf	✔
Add .env.local token	✔
Drop GeoJSON into /public/geojson	✔
Add skiResorts.ts	✔
Create SkiMap.tsx	✔
Create resort pages	✔
Render map on homepage	✔
Celebrate with hot chocolate	Optional but recommended