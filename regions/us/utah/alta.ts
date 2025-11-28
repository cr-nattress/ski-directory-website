import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const alta: Resort = {
  id: 'resort:alta',
  slug: 'alta',
  name: 'Alta Ski Area',
  tagline: 'Classic ski-only resort with legendary powder',
  description: 'Alta Ski Area is one of North America\'s legendary ski resorts, famous for its exceptional powder snow, challenging terrain, and traditional ski-only policy. Located in Little Cottonwood Canyon at the end of the road above Snowbird, Alta receives over 500 inches of Utah\'s champagne powder annually. The resort maintains a no-frills, skier-focused atmosphere with historic lodges and surprisingly affordable lift tickets. Alta\'s combination of steep chutes, open bowls, and perfectly spaced glades creates terrain that expert skiers return to year after year.',
  isActive: true,
  isLost: false,
  location: { lat: 40.5884, lng: -111.6386 },
  nearestCity: 'Salt Lake City, UT',
  distanceFromDenver: 540,
  driveTimeFromDenver: 470,
  stats: {
    skiableAcres: 2614,
    liftsCount: 11,
    runsCount: 116,
    verticalDrop: 2538,
    baseElevation: 8530,
    summitElevation: 11068,
    avgAnnualSnowfall: 547,
  },
  terrain: {
    beginner: 25,
    intermediate: 40,
    advanced: 35,
    expert: 0,
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
  rating: 4.8,
  reviewCount: 1234,
  heroImage: '/images/alta-hero.jpg',
  websiteUrl: 'https://www.alta.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/altaskiarea',
    instagram: 'https://www.instagram.com/altaskiarea',
  },
  features: {
    hasPark: false,
    hasHalfpipe: false,
    hasNightSkiing: false,
    hasBackcountryAccess: true,
    hasSpaVillage: false,
  },
  tags: ['expert', 'ikon-pass', 'deep-snow', 'ski-only', 'utah', 'classic'],
  highSpeedLifts: {
    count: 4,
    items: [
      { name: 'Collins Express', url: 'https://www.alta.com' },
      { name: 'Wildcat Express', url: 'https://www.alta.com' },
      { name: 'Supreme', url: 'https://www.alta.com' },
      { name: 'Sugarloaf', url: 'https://www.alta.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 4,
      items: [
        { name: 'Alta Lodge', url: 'https://www.altalodge.com' },
        { name: 'Rustler Lodge', url: 'https://www.rustlerlodge.com' },
        { name: 'Goldminer\'s Daughter', url: 'https://www.goldminersdaughter.com' },
      ],
    },
  },
};
