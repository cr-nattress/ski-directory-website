import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const sunshineVillage: Resort = {
  id: 'resort:sunshine-village',
  slug: 'sunshine-village',
  name: 'Sunshine Village',
  tagline: 'Canada\'s longest season and highest base elevation',
  description: 'Sunshine Village is located high in Banff National Park at a base elevation of 7,200 feet, giving it the highest base and longest season of any major Canadian ski resort - often opening in early November and closing in late May. The resort straddles the Continental Divide, spreading across three mountains with terrain ranging from gentle runs to the challenging Delirium Dive. Sunshine\'s signature is its consistent, dry powder snow and virtually no need for snowmaking. The Sunshine Mountain Lodge offers the only ski-in/ski-out accommodations in Banff National Park.',
  isActive: true,
  isLost: false,
  location: { lat: 51.0784, lng: -115.7608 },
  nearestCity: 'Banff, AB',
  distanceFromDenver: 840,
  driveTimeFromDenver: 750,
  stats: {
    skiableAcres: 3300,
    liftsCount: 12,
    runsCount: 137,
    verticalDrop: 3514,
    baseElevation: 7200,
    summitElevation: 8954,
    avgAnnualSnowfall: 360,
  },
  terrain: {
    beginner: 20,
    intermediate: 55,
    advanced: 25,
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
  rating: 4.6,
  reviewCount: 1234,
  heroImage: '/images/sunshine-village-hero.jpg',
  websiteUrl: 'https://www.skibanff.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/skibanffsunshine',
    instagram: 'https://www.instagram.com/skibanff',
  },
  features: {
    hasPark: true,
    hasHalfpipe: false,
    hasNightSkiing: false,
    hasBackcountryAccess: true,
    hasSpaVillage: true,
  },
  tags: ['destination', 'ikon-pass', 'long-season', 'high-elevation', 'alberta', 'powder'],
  highSpeedLifts: {
    count: 5,
    items: [
      { name: 'Sunshine Gondola', url: 'https://www.skibanff.com' },
      { name: 'Standish Express', url: 'https://www.skibanff.com' },
      { name: 'Angel Express', url: 'https://www.skibanff.com' },
      { name: 'Goat\'s Eye Express', url: 'https://www.skibanff.com' },
      { name: 'Teepee Town LX', url: 'https://www.skibanff.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 1,
      items: [
        { name: 'Sunshine Mountain Lodge', url: 'https://www.skibanff.com/lodging' },
      ],
    },
  },
};
