import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const alyeska: Resort = {
  id: 'resort:alyeska',
  slug: 'alyeska',
  name: 'Alyeska Resort',
  tagline: 'Alaska\'s premier destination resort with ocean views',
  description: 'Alyeska Resort is Alaska\'s largest and most developed ski area, offering a unique combination of exceptional terrain, stunning ocean views, and abundant snowfall. Located just 40 miles south of Anchorage in Girdwood, the resort receives an average of 669 inches of snow annually, making it one of the snowiest ski resorts in North America. The mountain features steep chutes, wide-open bowls, and perfectly groomed runs with views of Turnagain Arm. The 60-passenger aerial tram whisks skiers to the summit where adventurous experts can access challenging backcountry terrain.',
  isActive: true,
  isLost: false,
  location: { lat: 60.9694, lng: -149.0958 },
  nearestCity: 'Girdwood, AK',
  distanceFromDenver: 2850,
  driveTimeFromDenver: 2700,
  stats: {
    skiableAcres: 1610,
    liftsCount: 9,
    runsCount: 76,
    verticalDrop: 2500,
    baseElevation: 250,
    summitElevation: 2750,
    avgAnnualSnowfall: 669,
  },
  terrain: {
    beginner: 11,
    intermediate: 52,
    advanced: 21,
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
  rating: 4.6,
  reviewCount: 892,
  heroImage: '/images/alyeska-hero.jpg',
  websiteUrl: 'https://www.alyeskaresort.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/alyeskaresort',
    instagram: 'https://www.instagram.com/alyeskaresort',
  },
  features: {
    hasPark: true,
    hasHalfpipe: false,
    hasNightSkiing: true,
    hasBackcountryAccess: true,
    hasSpaVillage: true,
  },
  tags: ['destination', 'ikon-pass', 'deep-snow', 'ocean-views', 'alaska', 'expert'],
  highSpeedLifts: {
    count: 2,
    items: [
      { name: 'Alyeska Aerial Tram', url: 'https://www.alyeskaresort.com' },
      { name: 'Chair 6', url: 'https://www.alyeskaresort.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 3,
      items: [
        { name: 'Hotel Alyeska', url: 'https://www.alyeskaresort.com/hotel' },
      ],
    },
    restaurants: {
      count: 12,
      items: [
        { name: 'Seven Glaciers', url: 'https://www.alyeskaresort.com/dining' },
        { name: 'The Bake Shop', url: 'https://www.thebakeshop.com' },
      ],
    },
  },
};
