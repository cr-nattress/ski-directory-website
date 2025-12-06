# Story 37.6: Dining Enricher - Deduplication

## Description

Implement deduplication logic to prevent duplicate dining venues from being created. Uses slug matching, fuzzy name matching, and coordinate proximity.

## Acceptance Criteria

- [ ] Slug-based exact matching
- [ ] Fuzzy name matching (Levenshtein distance)
- [ ] Coordinate proximity matching (within 100m)
- [ ] Merge strategy for updating existing venues
- [ ] Track which venues are new vs updated
- [ ] Support for manual override protection

## Deduplication Strategy

```
1. Exact slug match → Update existing venue
2. Fuzzy name match (>90% similarity) + same city → Likely duplicate
3. Coordinate proximity (<100m) + similar name (>70%) → Likely duplicate
4. None of above → Create new venue
```

## Implementation

```typescript
// enricher/deduplicator.ts
import { DiningVenue } from '../types';
import { SupabaseService } from '../services/supabase';
import { logger } from '../utils/logger';

export interface DeduplicationResult {
  venue: DiningVenue;
  action: 'create' | 'update' | 'skip';
  existingId?: string;
  matchReason?: string;
}

export class Deduplicator {
  constructor(private supabase: SupabaseService) {}

  async process(venues: DiningVenue[]): Promise<DeduplicationResult[]> {
    const results: DeduplicationResult[] = [];

    // Fetch existing venues for comparison
    const existingVenues = await this.supabase.getAllVenues();
    const slugIndex = new Map(existingVenues.map(v => [v.slug, v]));

    for (const venue of venues) {
      const result = await this.checkDuplicate(venue, existingVenues, slugIndex);
      results.push(result);
    }

    return results;
  }

  private async checkDuplicate(
    venue: DiningVenue,
    existingVenues: DiningVenue[],
    slugIndex: Map<string, DiningVenue>
  ): Promise<DeduplicationResult> {
    // 1. Exact slug match
    const slugMatch = slugIndex.get(venue.slug);
    if (slugMatch) {
      if (slugMatch.verified) {
        logger.info(`Skipping verified venue: ${venue.name}`);
        return { venue, action: 'skip', existingId: slugMatch.id, matchReason: 'verified' };
      }
      return { venue, action: 'update', existingId: slugMatch.id, matchReason: 'slug_match' };
    }

    // 2. Fuzzy name match in same city
    for (const existing of existingVenues) {
      if (existing.city.toLowerCase() === venue.city.toLowerCase()) {
        const similarity = this.calculateSimilarity(
          venue.name.toLowerCase(),
          existing.name.toLowerCase()
        );
        if (similarity > 0.9) {
          if (existing.verified) {
            return { venue, action: 'skip', existingId: existing.id, matchReason: 'verified' };
          }
          return { venue, action: 'update', existingId: existing.id, matchReason: 'fuzzy_name' };
        }
      }
    }

    // 3. Coordinate proximity with name similarity
    for (const existing of existingVenues) {
      const distance = this.calculateDistance(
        venue.latitude, venue.longitude,
        existing.latitude, existing.longitude
      );

      if (distance < 0.1) { // Within ~500 feet
        const similarity = this.calculateSimilarity(
          venue.name.toLowerCase(),
          existing.name.toLowerCase()
        );
        if (similarity > 0.7) {
          if (existing.verified) {
            return { venue, action: 'skip', existingId: existing.id, matchReason: 'verified' };
          }
          return { venue, action: 'update', existingId: existing.id, matchReason: 'proximity' };
        }
      }
    }

    // No match found - create new
    return { venue, action: 'create' };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Levenshtein distance normalized to similarity score
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula - returns miles
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
```

## Merge Strategy

When updating an existing venue:
- Keep `verified` venues untouched
- Merge arrays (venue_type, cuisine_type) - union of values
- Prefer non-empty values over empty
- Update `updated_at` timestamp
- Track source of update in enrichment log

## Effort

Medium (2-3 hours)
