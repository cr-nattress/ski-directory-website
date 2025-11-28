import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const taos: Resort = {
  id: 'resort:taos',
  slug: 'taos',
  name: 'Taos Ski Valley',
  tagline: 'Soul-satisfying steeps with legendary Southwest culture',
  description: 'Taos Ski Valley combines world-class expert terrain with the unique cultural heritage of northern New Mexico. Founded by Swiss and German ski instructors in 1955, Taos developed a reputation for challenging skiing and a distinctive European atmosphere. The resort\'s steep terrain, highlighted by runs like Al\'s Run and the infamous Kachina Peak, has long attracted serious skiers. Recent investments have modernized lifts and base facilities while preserving Taos\'s soul. The proximity to historic Taos Pueblo and the creative community of Taos adds an unmatchable cultural dimension to any ski trip.',
  isActive: true,
  isLost: false,
  location: { lat: 36.5964, lng: -105.4544 },
  nearestCity: 'Taos, NM',
  distanceFromDenver: 280,
  driveTimeFromDenver: 270,
  stats: {
    skiableAcres: 1294,
    liftsCount: 15,
    runsCount: 110,
    verticalDrop: 3281,
    baseElevation: 9207,
    summitElevation: 12481,
    avgAnnualSnowfall: 305,
  },
  terrain: {
    beginner: 24,
    intermediate: 25,
    advanced: 51,
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
  reviewCount: 934,
  heroImage: '/images/taos-hero.jpg',
  websiteUrl: 'https://www.skitaos.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/taosskivalley',
    instagram: 'https://www.instagram.com/taosskivalley',
  },
  features: {
    hasPark: true,
    hasHalfpipe: false,
    hasNightSkiing: false,
    hasBackcountryAccess: true,
    hasSpaVillage: true,
  },
  tags: ['expert', 'ikon-pass', 'steep', 'culture', 'new-mexico', 'southwest'],
  highSpeedLifts: {
    count: 5,
    items: [
      { name: 'Kachina Peak Lift', url: 'https://www.skitaos.com' },
      { name: 'Lift 1', url: 'https://www.skitaos.com' },
      { name: 'Lift 2', url: 'https://www.skitaos.com' },
      { name: 'Lift 4', url: 'https://www.skitaos.com' },
      { name: 'Lift 7', url: 'https://www.skitaos.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 10,
      items: [
        { name: 'The Blake', url: 'https://www.skitaos.com/the-blake' },
        { name: 'Edelweiss Lodge & Spa', url: 'https://www.edelweisslodgeandspa.com' },
      ],
    },
  },
};
