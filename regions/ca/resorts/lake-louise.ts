import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const lakeLouise: Resort = {
  id: 'resort:lake-louise',
  slug: 'lake-louise',
  name: 'Lake Louise Ski Resort',
  tagline: 'Spectacular Canadian Rockies terrain in Banff National Park',
  description: 'Lake Louise Ski Resort is set within Banff National Park, offering some of the most spectacular scenery in North American skiing. With over 4,200 acres of varied terrain spread across four mountain faces, Lake Louise delivers everything from gentle beginner slopes to challenging back bowls. The resort hosts annual World Cup races and is known for its reliable snow, stunning views of the Victoria Glacier, and genuinely Canadian atmosphere. The iconic Fairmont Chateau Lake Louise sits below the mountain, providing luxury accommodations with legendary views of the frozen lake.',
  isActive: true,
  isLost: false,
  location: { lat: 51.4254, lng: -116.1773 },
  nearestCity: 'Lake Louise, AB',
  distanceFromDenver: 870,
  driveTimeFromDenver: 780,
  stats: {
    skiableAcres: 4200,
    liftsCount: 10,
    runsCount: 145,
    verticalDrop: 3250,
    baseElevation: 5400,
    summitElevation: 8650,
    avgAnnualSnowfall: 177,
  },
  terrain: {
    beginner: 25,
    intermediate: 45,
    advanced: 30,
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
  rating: 4.7,
  reviewCount: 1678,
  heroImage: '/images/lake-louise-hero.jpg',
  websiteUrl: 'https://www.skilouise.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/skilouise',
    instagram: 'https://www.instagram.com/skilouise',
  },
  features: {
    hasPark: true,
    hasHalfpipe: false,
    hasNightSkiing: false,
    hasBackcountryAccess: true,
    hasSpaVillage: true,
  },
  tags: ['destination', 'ikon-pass', 'scenic', 'national-park', 'alberta', 'world-cup'],
  highSpeedLifts: {
    count: 5,
    items: [
      { name: 'Grizzly Express Gondola', url: 'https://www.skilouise.com' },
      { name: 'Top of the World Express', url: 'https://www.skilouise.com' },
      { name: 'Summit Platter', url: 'https://www.skilouise.com' },
      { name: 'Glacier Express', url: 'https://www.skilouise.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 5,
      items: [
        { name: 'Fairmont Chateau Lake Louise', url: 'https://www.fairmont.com/lake-louise' },
        { name: 'Deer Lodge', url: 'https://www.crmr.com/deer' },
        { name: 'Lake Louise Inn', url: 'https://www.lakelooiseinn.com' },
      ],
    },
  },
};
