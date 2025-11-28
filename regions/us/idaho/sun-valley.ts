import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const sunValley: Resort = {
  id: 'resort:sun-valley',
  slug: 'sun-valley',
  name: 'Sun Valley Resort',
  tagline: 'America\'s first destination ski resort',
  description: 'Sun Valley Resort holds the distinguished honor of being America\'s first destination ski resort, having invented the chairlift in 1936. Located in central Idaho, Sun Valley combines rich ski history with world-class terrain on Bald Mountain. "Baldy" is renowned for its impeccable grooming, consistent fall-line runs, and reliable snow conditions. The resort\'s location on the edge of the Rocky Mountains provides exceptional sunny weather, giving the resort its name. The charming town of Ketchum provides a sophisticated base area with excellent dining and a genuine mountain community feel.',
  isActive: true,
  isLost: false,
  location: { lat: 43.6960, lng: -114.3525 },
  nearestCity: 'Ketchum, ID',
  distanceFromDenver: 680,
  driveTimeFromDenver: 610,
  stats: {
    skiableAcres: 2054,
    liftsCount: 18,
    runsCount: 121,
    verticalDrop: 3400,
    baseElevation: 5750,
    summitElevation: 9150,
    avgAnnualSnowfall: 220,
  },
  terrain: {
    beginner: 36,
    intermediate: 42,
    advanced: 22,
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
  passAffiliations: ['epic'],
  rating: 4.6,
  reviewCount: 1123,
  heroImage: '/images/sun-valley-hero.jpg',
  websiteUrl: 'https://www.sunvalley.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/sunvalley',
    instagram: 'https://www.instagram.com/sunvalley',
  },
  features: {
    hasPark: true,
    hasHalfpipe: true,
    hasNightSkiing: false,
    hasBackcountryAccess: true,
    hasSpaVillage: true,
  },
  tags: ['destination', 'epic-pass', 'historic', 'groomed', 'idaho', 'sunny'],
  highSpeedLifts: {
    count: 13,
    items: [
      { name: 'River Run Express', url: 'https://www.sunvalley.com' },
      { name: 'Seattle Ridge Express', url: 'https://www.sunvalley.com' },
      { name: 'Challenger Express', url: 'https://www.sunvalley.com' },
      { name: 'Cold Springs Express', url: 'https://www.sunvalley.com' },
      { name: 'Christmas Express', url: 'https://www.sunvalley.com' },
    ],
  },
  baseAreas: {
    count: 2,
    items: [
      { name: 'River Run', url: 'https://www.sunvalley.com' },
      { name: 'Warm Springs', url: 'https://www.sunvalley.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 15,
      items: [
        { name: 'Sun Valley Lodge', url: 'https://www.sunvalley.com' },
        { name: 'Sun Valley Inn', url: 'https://www.sunvalley.com' },
        { name: 'Limelight Hotel', url: 'https://www.limelighthotels.com/ketchum' },
      ],
    },
    restaurants: {
      count: 35,
      items: [
        { name: 'Gretchen\'s', url: 'https://www.sunvalley.com' },
        { name: 'The Roundhouse', url: 'https://www.sunvalley.com' },
        { name: 'Pioneer Saloon', url: 'https://www.pioneersaloon.com' },
      ],
    },
  },
};
