import { Category } from '@/lib/types/category';
import { Resort } from '@/lib/types';

export const categories: Category[] = [
  {
    id: 'epic-pass',
    label: 'Epic Pass',
    icon: '🏔️',
    filter: (resort: Resort) => resort.passAffiliations.includes('epic'),
  },
  {
    id: 'ikon-pass',
    label: 'Ikon Pass',
    icon: '🎿',
    filter: (resort: Resort) => resort.passAffiliations.includes('ikon'),
  },
  {
    id: 'family',
    label: 'Family',
    icon: '👨‍👩‍👧',
    filter: (resort: Resort) =>
      resort.tags.includes('family-friendly') ||
      resort.terrain.beginner >= 15,
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: '💰',
    filter: (resort: Resort) =>
      resort.tags.includes('value') ||
      resort.passAffiliations.includes('local'),
  },
  {
    id: 'expert',
    label: 'Expert',
    icon: '🏂',
    filter: (resort: Resort) =>
      (resort.terrain.expert + resort.terrain.advanced) >= 50 ||
      resort.tags.includes('expert'),
  },
  {
    id: 'beginner',
    label: 'Beginner',
    icon: '🌟',
    filter: (resort: Resort) =>
      resort.terrain.beginner >= 15 ||
      resort.terrain.beginner + resort.terrain.intermediate >= 60,
  },
  {
    id: 'near-denver',
    label: 'Near Denver',
    icon: '📍',
    filter: (resort: Resort) =>
      resort.driveTimeFromDenver <= 120 ||
      resort.tags.includes('near-denver'),
  },
  {
    id: 'i70-corridor',
    label: 'I-70 Corridor',
    icon: '🛣️',
    filter: (resort: Resort) =>
      resort.driveTimeFromDenver <= 150 &&
      resort.distanceFromDenver <= 100,
  },
  {
    id: 'hidden-gems',
    label: 'Hidden Gems',
    icon: '💎',
    filter: (resort: Resort) =>
      resort.stats.skiableAcres < 2500 ||
      resort.tags.includes('hidden') ||
      resort.reviewCount < 1500,
  },
  {
    id: 'lost',
    label: 'Lost Ski Areas',
    icon: '🏚️',
    filter: (resort: Resort) => resort.isLost === true,
  },
];
