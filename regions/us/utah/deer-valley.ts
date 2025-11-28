import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const deerValley: Resort = {
  id: 'resort:deer-valley',
  slug: 'deer-valley',
  name: 'Deer Valley Resort',
  tagline: 'Ski Magazine\'s #1 ski resort for legendary service',
  description: 'Deer Valley Resort consistently ranks as the top ski resort in North America, renowned for its impeccable grooming, limited ticket sales, and unmatched guest service. The resort pioneered the concept of luxury skiing and maintains its exclusive atmosphere by capping daily visitors and prohibiting snowboarding. Six mountains offer perfectly maintained terrain from gentle cruisers to challenging expert runs. Every detail is refined, from complimentary ski valets to gourmet on-mountain dining. Deer Valley\'s dedication to quality has earned it more Ski Magazine #1 rankings than any other resort.',
  isActive: true,
  isLost: false,
  location: { lat: 40.6375, lng: -111.4783 },
  nearestCity: 'Park City, UT',
  distanceFromDenver: 525,
  driveTimeFromDenver: 450,
  stats: {
    skiableAcres: 2026,
    liftsCount: 21,
    runsCount: 103,
    verticalDrop: 3000,
    baseElevation: 6570,
    summitElevation: 9570,
    avgAnnualSnowfall: 300,
  },
  terrain: {
    beginner: 27,
    intermediate: 41,
    advanced: 32,
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
  rating: 4.9,
  reviewCount: 1456,
  heroImage: '/images/deer-valley-hero.jpg',
  websiteUrl: 'https://www.deervalley.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/deervalleyresort',
    instagram: 'https://www.instagram.com/deervalleyresort',
  },
  features: {
    hasPark: false,
    hasHalfpipe: false,
    hasNightSkiing: false,
    hasBackcountryAccess: false,
    hasSpaVillage: true,
  },
  tags: ['luxury', 'ikon-pass', 'groomed', 'upscale', 'utah', 'ski-only'],
  highSpeedLifts: {
    count: 12,
    items: [
      { name: 'Jordanelle Gondola', url: 'https://www.deervalley.com' },
      { name: 'Carpenter Express', url: 'https://www.deervalley.com' },
      { name: 'Sterling Express', url: 'https://www.deervalley.com' },
      { name: 'Silver Lake Express', url: 'https://www.deervalley.com' },
      { name: 'Quincy Express', url: 'https://www.deervalley.com' },
    ],
  },
  baseAreas: {
    count: 2,
    items: [
      { name: 'Snow Park Lodge', url: 'https://www.deervalley.com' },
      { name: 'Silver Lake Village', url: 'https://www.deervalley.com' },
    ],
  },
  nearby: {
    restaurants: {
      count: 8,
      items: [
        { name: 'The Mariposa', url: 'https://www.deervalley.com/dining' },
        { name: 'Fireside Dining', url: 'https://www.deervalley.com/dining' },
        { name: 'Royal Street Café', url: 'https://www.deervalley.com/dining' },
      ],
    },
    hotels: {
      count: 5,
      items: [
        { name: 'The St. Regis Deer Valley', url: 'https://www.marriott.com/hotels/travel/slcxr-the-st-regis-deer-valley/' },
        { name: 'Stein Eriksen Lodge', url: 'https://www.steinlodge.com' },
        { name: 'Montage Deer Valley', url: 'https://www.montagehotels.com/deervalley' },
      ],
    },
  },
};
