import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const heavenly: Resort = {
  id: 'resort:heavenly',
  slug: 'heavenly',
  name: 'Heavenly Mountain Resort',
  tagline: 'Ski two states with breathtaking Lake Tahoe views',
  description: 'Heavenly Mountain Resort straddles the California-Nevada border, offering the unique experience of skiing in two states in one day. The resort is famous for its panoramic views of Lake Tahoe and the surrounding Sierra Nevada mountains, visible from nearly every run. With the largest snowmaking system in the West and 4,800 acres of terrain, Heavenly provides reliable conditions and diverse skiing. The Heavenly Gondola rises directly from the casinos and entertainment of South Lake Tahoe, making it the most accessible major resort at the lake.',
  isActive: true,
  isLost: false,
  location: { lat: 38.9353, lng: -119.9400 },
  nearestCity: 'South Lake Tahoe, CA',
  distanceFromDenver: 890,
  driveTimeFromDenver: 810,
  stats: {
    skiableAcres: 4800,
    liftsCount: 28,
    runsCount: 97,
    verticalDrop: 3500,
    baseElevation: 6540,
    summitElevation: 10067,
    avgAnnualSnowfall: 360,
  },
  terrain: {
    beginner: 20,
    intermediate: 45,
    advanced: 25,
    expert: 10,
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
  rating: 4.5,
  reviewCount: 1567,
  heroImage: '/images/heavenly-hero.jpg',
  websiteUrl: 'https://www.skiheavenly.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/skiheavenly',
    instagram: 'https://www.instagram.com/skiheavenly',
  },
  features: {
    hasPark: true,
    hasHalfpipe: false,
    hasNightSkiing: false,
    hasBackcountryAccess: false,
    hasSpaVillage: true,
  },
  tags: ['destination', 'epic-pass', 'lake-tahoe', 'california', 'nevada', 'views'],
  highSpeedLifts: {
    count: 8,
    items: [
      { name: 'Heavenly Gondola', url: 'https://www.skiheavenly.com' },
      { name: 'Tamarack Express', url: 'https://www.skiheavenly.com' },
      { name: 'Dipper Express', url: 'https://www.skiheavenly.com' },
      { name: 'Sky Express', url: 'https://www.skiheavenly.com' },
      { name: 'Comet Express', url: 'https://www.skiheavenly.com' },
    ],
  },
  baseAreas: {
    count: 4,
    items: [
      { name: 'California Base Lodge', url: 'https://www.skiheavenly.com' },
      { name: 'Gondola Base', url: 'https://www.skiheavenly.com' },
      { name: 'Boulder Lodge', url: 'https://www.skiheavenly.com' },
      { name: 'Stagecoach Lodge', url: 'https://www.skiheavenly.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 50,
      items: [
        { name: 'Marriott Grand Residence', url: 'https://www.marriott.com' },
        { name: 'Hard Rock Hotel & Casino', url: 'https://www.hardrockcasinolaketahoe.com' },
        { name: 'Harrah\'s Lake Tahoe', url: 'https://www.caesars.com/harrahs-tahoe' },
      ],
    },
    bars: {
      count: 30,
      items: [
        { name: 'The Loft', url: 'https://www.thelofttahoe.com' },
        { name: 'Whiskey Dick\'s', url: 'https://www.sierrataphouseslt.com' },
      ],
    },
  },
};
