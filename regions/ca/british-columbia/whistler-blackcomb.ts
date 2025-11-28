import { Resort } from '../../../apps/v1/lib/mock-data/types';

export const whistlerBlackcomb: Resort = {
  id: 'resort:whistler-blackcomb',
  slug: 'whistler-blackcomb',
  name: 'Whistler Blackcomb',
  tagline: 'North America\'s largest and most celebrated ski resort',
  description: 'Whistler Blackcomb is the crown jewel of North American skiing, combining two massive mountains with over 8,100 acres of skiable terrain, the continent\'s most vertical feet, and a world-class pedestrian village. Host of the 2010 Winter Olympics alpine and Nordic events, Whistler Blackcomb delivers everything from gentle beginner slopes to extreme alpine bowls and glaciers. The PEAK 2 PEAK Gondola, an engineering marvel spanning 4.4 kilometers between the two mountains, offers jaw-dropping views and unmatched terrain access. Whistler Village provides a complete resort experience with hundreds of restaurants, bars, and shops.',
  isActive: true,
  isLost: false,
  location: { lat: 50.1163, lng: -122.9574 },
  nearestCity: 'Whistler, BC',
  distanceFromDenver: 1150,
  driveTimeFromDenver: 1020,
  stats: {
    skiableAcres: 8171,
    liftsCount: 37,
    runsCount: 200,
    verticalDrop: 5280,
    baseElevation: 2214,
    summitElevation: 7494,
    avgAnnualSnowfall: 461,
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
  passAffiliations: ['epic'],
  rating: 4.8,
  reviewCount: 3456,
  heroImage: '/images/whistler-blackcomb-hero.jpg',
  websiteUrl: 'https://www.whistlerblackcomb.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/whistlerblackcomb',
    instagram: 'https://www.instagram.com/whistlerblackcomb',
    youtube: 'https://www.youtube.com/whistlerblackcomb',
  },
  features: {
    hasPark: true,
    hasHalfpipe: true,
    hasNightSkiing: false,
    hasBackcountryAccess: true,
    hasSpaVillage: true,
  },
  tags: ['destination', 'epic-pass', 'largest', 'olympic', 'british-columbia', 'glacier'],
  highSpeedLifts: {
    count: 16,
    items: [
      { name: 'PEAK 2 PEAK Gondola', url: 'https://www.whistlerblackcomb.com' },
      { name: 'Whistler Village Gondola', url: 'https://www.whistlerblackcomb.com' },
      { name: 'Blackcomb Gondola', url: 'https://www.whistlerblackcomb.com' },
      { name: 'Creekside Gondola', url: 'https://www.whistlerblackcomb.com' },
      { name: 'Fitzsimmons Express', url: 'https://www.whistlerblackcomb.com' },
    ],
  },
  baseAreas: {
    count: 3,
    items: [
      { name: 'Whistler Village', url: 'https://www.whistlerblackcomb.com' },
      { name: 'Creekside', url: 'https://www.whistlerblackcomb.com' },
      { name: 'Upper Village', url: 'https://www.whistlerblackcomb.com' },
    ],
  },
  nearby: {
    hotels: {
      count: 100,
      items: [
        { name: 'Fairmont Chateau Whistler', url: 'https://www.fairmont.com/whistler' },
        { name: 'Four Seasons Resort Whistler', url: 'https://www.fourseasons.com/whistler' },
        { name: 'Pan Pacific Whistler', url: 'https://www.panpacific.com/whistler' },
      ],
    },
    restaurants: {
      count: 150,
      items: [
        { name: 'Araxi Restaurant + Oyster Bar', url: 'https://www.araxi.com' },
        { name: 'Christine\'s', url: 'https://www.whistlerblackcomb.com' },
        { name: 'The Keg', url: 'https://www.kegsteakhouse.com' },
      ],
    },
    bars: {
      count: 50,
      items: [
        { name: 'Garfinkel\'s', url: 'https://www.garfs.com' },
        { name: 'Longhorn Saloon', url: 'https://www.longhornsaloon.ca' },
        { name: 'GLC', url: 'https://www.theglc.ca' },
      ],
    },
  },
};
