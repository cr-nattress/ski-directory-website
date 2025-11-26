import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const montTremblant: Resort = {
  id: 'resort:mont-tremblant',
  slug: 'mont-tremblant',
  name: 'Mont Tremblant',
  tagline: 'Eastern Canada\'s premier four-season destination',
  description: 'Mont Tremblant is eastern Canada\'s premier destination ski resort, combining excellent terrain with a world-class pedestrian village that rivals any in North America. Located in the Laurentian Mountains of Quebec, the resort spans four distinct faces offering terrain for all ability levels, from gentle beginner runs to the challenging Expo glades. The colorful Quebec-style village at the base features over 100 shops and restaurants, creating an authentic French-Canadian atmosphere. Mont Tremblant consistently ranks among the top ski resorts in eastern North America.',
  isActive: true,
  isLost: false,
  location: { lat: 46.2097, lng: -74.5853 },
  nearestCity: 'Mont-Tremblant, QC',
  distanceFromDenver: 2100,
  driveTimeFromDenver: 1950,
  stats: {
    skiableAcres: 755,
    liftsCount: 14,
    runsCount: 102,
    verticalDrop: 2116,
    baseElevation: 870,
    summitElevation: 2871,
    avgAnnualSnowfall: 181,
  },
  terrain: {
    beginner: 21,
    intermediate: 32,
    advanced: 31,
    expert: 16,
  },
  conditions: {
    snowfall24h: 0,
    snowfall72h: 0,
    baseDepth: 0,
    terrainOpen: 0,
    liftsOpen: 0,
    status: 'closed',
  },
  passAffiliations: ['ikon'],
  rating: 4.5,
  reviewCount: 2345,
  heroImage: '/images/mont-tremblant-hero.jpg',
  websiteUrl: 'https://www.tremblant.ca',
  socialMedia: {
    facebook: 'https://www.facebook.com/Tremblant',
    instagram: 'https://www.instagram.com/monttremblant',
  },
  features: {
    hasPark: true,
    hasHalfpipe: true,
    hasNightSkiing: true,
    hasBackcountryAccess: false,
    hasSpaVillage: true,
  },
  tags: ['destination', 'ikon-pass', 'village', 'family', 'quebec', 'four-season'],
  highSpeedLifts: {
    count: 5,
    items: [
      { name: 'Le Cabriolet Gondola', url: 'https://www.tremblant.ca' },
      { name: 'Flying Mile Express', url: 'https://www.tremblant.ca' },
      { name: 'TGV Express', url: 'https://www.tremblant.ca' },
      { name: 'Expo Express', url: 'https://www.tremblant.ca' },
      { name: 'Edge Express', url: 'https://www.tremblant.ca' },
    ],
  },
  baseAreas: {
    count: 2,
    items: [
      { name: 'Pedestrian Village', url: 'https://www.tremblant.ca' },
      { name: 'Versant Soleil', url: 'https://www.tremblant.ca' },
    ],
  },
  nearby: {
    hotels: {
      count: 25,
      items: [
        { name: 'Fairmont Tremblant', url: 'https://www.fairmont.com/tremblant' },
        { name: 'Le Westin Resort & Spa', url: 'https://www.marriott.com' },
        { name: 'Homewood Suites', url: 'https://www.hilton.com' },
      ],
    },
    restaurants: {
      count: 40,
      items: [
        { name: 'La Forge Bar & Grill', url: 'https://www.tremblant.ca' },
        { name: 'Windigo', url: 'https://www.tremblant.ca' },
      ],
    },
  },
};
