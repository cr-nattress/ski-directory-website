import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const stowe: Resort = {
  id: 'resort:stowe',
  slug: 'stowe',
  name: 'Stowe Mountain Resort',
  tagline: 'Vermont\'s legendary ski capital with iconic charm',
  description: 'Stowe Mountain Resort is the iconic ski destination of the East, combining challenging terrain with a quintessential New England village atmosphere. Mount Mansfield, Vermont\'s highest peak at 4,395 feet, delivers some of the most demanding terrain east of the Rockies, including the legendary Front Four trails. The picturesque town of Stowe sits just down the mountain road, offering world-class dining, shopping, and lodging in a beautifully preserved Vermont village. Vail Resorts\' ownership has brought significant investment while maintaining Stowe\'s timeless character.',
  isActive: true,
  isLost: false,
  location: { lat: 44.5303, lng: -72.7814 },
  nearestCity: 'Stowe, VT',
  distanceFromDenver: 2000,
  driveTimeFromDenver: 1850,
  stats: {
    skiableAcres: 485,
    liftsCount: 13,
    runsCount: 116,
    verticalDrop: 2360,
    baseElevation: 1559,
    summitElevation: 3719,
    avgAnnualSnowfall: 314,
  },
  terrain: {
    beginner: 16,
    intermediate: 59,
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
  passAffiliations: ['epic'],
  rating: 4.6,
  reviewCount: 1234,
  heroImage: '/images/stowe-hero.jpg',
  websiteUrl: 'https://www.stowe.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/stlowehotelmtn',
    instagram: 'https://www.instagram.com/stowemt',
  },
  features: {
    hasPark: true,
    hasHalfpipe: false,
    hasNightSkiing: false,
    hasBackcountryAccess: false,
    hasSpaVillage: true,
  },
  tags: ['destination', 'epic-pass', 'classic', 'village', 'vermont', 'expert'],
  highSpeedLifts: {
    count: 5,
    items: [
      { name: 'Over Easy Gondola', url: 'https://www.stowe.com' },
      { name: 'Mountain Road Express', url: 'https://www.stowe.com' },
      { name: 'FourRunner Quad', url: 'https://www.stowe.com' },
      { name: 'Sensation Quad', url: 'https://www.stowe.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 20,
      items: [
        { name: 'The Lodge at Spruce Peak', url: 'https://www.sprucepeak.com' },
        { name: 'Stowe Mountain Lodge', url: 'https://www.destinationhotels.com/stowe-mountain-lodge' },
        { name: 'Trapp Family Lodge', url: 'https://www.trappfamily.com' },
      ],
    },
    restaurants: {
      count: 40,
      items: [
        { name: 'Harrison\'s Restaurant', url: 'https://www.harrisonsstowe.com' },
        { name: 'The Whip Bar & Grill', url: 'https://www.greenmountaininn.com' },
      ],
    },
  },
};
