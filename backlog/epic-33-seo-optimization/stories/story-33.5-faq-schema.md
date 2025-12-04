# Story 33.5: Add FAQ Structured Data

## Priority: Medium

## Context

FAQ schema markup enables rich snippets in search results, showing expandable Q&A directly in Google. This increases click-through rates and provides immediate value to searchers.

## Current State

- No FAQ schema implemented
- Missing opportunity for rich snippets
- Common ski resort questions not structured for search

## Requirements

1. Create FAQ structured data component
2. Add FAQ schema to resort detail pages
3. Include common resort questions (conditions, passes, terrain)
4. Validate with Google Rich Results Test

## Implementation

### FAQ Schema Component

```tsx
// components/structured-data/FAQSchema.tsx
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Usage in Resort Detail Pages

```tsx
// app/[state]/[slug]/page.tsx
import { FAQSchema } from '@/components/structured-data/FAQSchema';

function generateResortFAQs(resort: Resort): FAQItem[] {
  const faqs: FAQItem[] = [];

  // Pass affiliation question
  if (resort.passAffiliations.length > 0) {
    const passes = resort.passAffiliations.join(', ');
    faqs.push({
      question: `What ski passes work at ${resort.name}?`,
      answer: `${resort.name} accepts the following passes: ${passes}. Check with the resort for blackout dates and restrictions.`,
    });
  }

  // Terrain question
  faqs.push({
    question: `How much skiable terrain does ${resort.name} have?`,
    answer: `${resort.name} offers ${resort.stats.skiableAcres.toLocaleString()} skiable acres with ${resort.stats.runsCount} runs and ${resort.stats.liftsCount} lifts. Vertical drop is ${resort.stats.verticalDrop.toLocaleString()} feet.`,
  });

  // Difficulty question
  faqs.push({
    question: `What is the terrain difficulty at ${resort.name}?`,
    answer: `${resort.name} terrain breakdown: ${resort.terrain.beginner}% beginner, ${resort.terrain.intermediate}% intermediate, ${resort.terrain.advanced}% advanced, ${resort.terrain.expert}% expert.`,
  });

  // Location question
  faqs.push({
    question: `Where is ${resort.name} located?`,
    answer: `${resort.name} is located near ${resort.nearestCity}, ${resort.stateCode.toUpperCase()}. It's approximately ${resort.distanceFromMajorCity} miles from ${resort.majorCityName}.`,
  });

  return faqs;
}

// In the page component
<FAQSchema faqs={generateResortFAQs(resort)} />
```

## Acceptance Criteria

- [ ] FAQ schema component created
- [ ] Resort pages include FAQ structured data
- [ ] FAQs are dynamically generated from resort data
- [ ] Schema validates with Google Rich Results Test
- [ ] At least 3 FAQs per resort page

## Testing

1. Use Google Rich Results Test on resort pages
2. Verify FAQ markup in page source
3. Check Schema.org validator
4. Monitor Google Search Console for FAQ rich results

## Effort: Small (1-2 hours)
