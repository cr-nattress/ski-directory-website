/**
 * Resort FAQ Generation Utility
 * Generates frequently asked questions for resort pages
 */

import { Resort } from '@shared/types';

interface FAQItem {
  question: string;
  answer: string;
}

export function generateResortFAQs(resort: Resort): FAQItem[] {
  const faqs: FAQItem[] = [];
  const stateName = resort.stateCode?.toUpperCase() || '';

  // Pass affiliation question
  if (resort.passAffiliations && resort.passAffiliations.length > 0) {
    const passes = resort.passAffiliations
      .map((p) => {
        switch (p) {
          case 'epic': return 'Epic Pass';
          case 'ikon': return 'Ikon Pass';
          case 'indy': return 'Indy Pass';
          case 'mountain-collective': return 'Mountain Collective';
          case 'powder-alliance': return 'Powder Alliance';
          default: return p.charAt(0).toUpperCase() + p.slice(1);
        }
      })
      .join(', ');
    faqs.push({
      question: `What ski passes work at ${resort.name}?`,
      answer: `${resort.name} accepts the following passes: ${passes}. Check with the resort for specific blackout dates and restrictions.`,
    });
  }

  // Terrain question
  if (resort.stats?.skiableAcres && resort.stats?.runsCount && resort.stats?.liftsCount) {
    faqs.push({
      question: `How much skiable terrain does ${resort.name} have?`,
      answer: `${resort.name} offers ${resort.stats.skiableAcres.toLocaleString()} skiable acres with ${resort.stats.runsCount} runs and ${resort.stats.liftsCount} lifts. The vertical drop is ${resort.stats.verticalDrop?.toLocaleString() || 'N/A'} feet.`,
    });
  }

  // Difficulty question
  if (resort.terrain) {
    faqs.push({
      question: `What is the terrain difficulty breakdown at ${resort.name}?`,
      answer: `${resort.name} terrain breakdown: ${resort.terrain.beginner}% beginner, ${resort.terrain.intermediate}% intermediate, ${resort.terrain.advanced}% advanced, ${resort.terrain.expert}% expert.`,
    });
  }

  // Location question
  if (resort.nearestCity) {
    let locationAnswer = `${resort.name} is located near ${resort.nearestCity}, ${stateName}.`;
    if (resort.majorCityName && resort.distanceFromMajorCity) {
      locationAnswer += ` It's approximately ${resort.distanceFromMajorCity} miles from ${resort.majorCityName}.`;
    }
    faqs.push({
      question: `Where is ${resort.name} located?`,
      answer: locationAnswer,
    });
  }

  // Snowfall question
  if (resort.stats?.avgAnnualSnowfall) {
    faqs.push({
      question: `How much snow does ${resort.name} get?`,
      answer: `${resort.name} receives an average of ${resort.stats.avgAnnualSnowfall} inches of snow per year.`,
    });
  }

  // Features question
  const features: string[] = [];
  if (resort.features?.hasNightSkiing) features.push('night skiing');
  if (resort.features?.hasPark) features.push('terrain parks');
  if (resort.features?.hasHalfpipe) features.push('halfpipe');
  if (resort.features?.hasBackcountryAccess) features.push('backcountry access');

  if (features.length > 0) {
    faqs.push({
      question: `What special features does ${resort.name} offer?`,
      answer: `${resort.name} offers ${features.join(', ')}.`,
    });
  }

  return faqs;
}

export type { FAQItem };
