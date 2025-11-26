import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const jacksonHole: Resort = {
  id: 'resort:jackson-hole',
  slug: 'jackson-hole',
  name: 'Jackson Hole Mountain Resort',
  tagline: 'The legendary steeps with North America\'s most continuous vertical',
  description: 'Jackson Hole Mountain Resort is synonymous with expert skiing and big mountain adventure. Home to Corbet\'s Couloir, America\'s most famous double black diamond, Jackson Hole offers the most continuous vertical drop of any ski resort in North America at 4,139 feet. The 100-passenger aerial tram rises straight from Teton Village to the top of Rendezvous Mountain, accessing steep chutes, wide bowls, and challenging terrain. While experts flock to the steeps, Jackson Hole has invested heavily in intermediate terrain and family-friendly areas, making the resort surprisingly accessible.',
  isActive: true,
  isLost: false,
  location: { lat: 43.5875, lng: -110.8278 },
  nearestCity: 'Jackson, WY',
  distanceFromDenver: 480,
  driveTimeFromDenver: 450,
  stats: {
    skiableAcres: 2500,
    liftsCount: 15,
    runsCount: 133,
    verticalDrop: 4139,
    baseElevation: 6311,
    summitElevation: 10450,
    avgAnnualSnowfall: 459,
  },
  terrain: {
    beginner: 10,
    intermediate: 40,
    advanced: 50,
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
  reviewCount: 2134,
  heroImage: '/images/jackson-hole-hero.jpg',
  websiteUrl: 'https://www.jacksonhole.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/JacksonHole',
    instagram: 'https://www.instagram.com/jacksonhole',
    youtube: 'https://www.youtube.com/jacksonholemountainresort',
  },
  features: {
    hasPark: true,
    hasHalfpipe: false,
    hasNightSkiing: false,
    hasBackcountryAccess: true,
    hasSpaVillage: true,
  },
  tags: ['destination', 'ikon-pass', 'expert', 'steep', 'wyoming', 'tram'],
  highSpeedLifts: {
    count: 7,
    items: [
      { name: 'Aerial Tram', url: 'https://www.jacksonhole.com' },
      { name: 'Bridger Gondola', url: 'https://www.jacksonhole.com' },
      { name: 'Sweetwater Gondola', url: 'https://www.jacksonhole.com' },
      { name: 'Teewinot Express', url: 'https://www.jacksonhole.com' },
      { name: 'Thunder Express', url: 'https://www.jacksonhole.com' },
    ],
  },
  baseAreas: {
    count: 1,
    items: [
      { name: 'Teton Village', url: 'https://www.jacksonhole.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 15,
      items: [
        { name: 'Four Seasons Resort', url: 'https://www.fourseasons.com/jacksonhole' },
        { name: 'Hotel Terra', url: 'https://www.hotelterrajacksonhole.com' },
        { name: 'Teton Mountain Lodge', url: 'https://www.tetonlodge.com' },
      ],
    },
    restaurants: {
      count: 25,
      items: [
        { name: 'Il Villaggio Osteria', url: 'https://www.ilvillaggioosteria.com' },
        { name: 'Westbank Grill', url: 'https://www.fourseasons.com/jacksonhole' },
      ],
    },
  },
};
