import { Resort } from '@/lib/types';
import { RelatedResorts } from './RelatedResorts';
import { getResortsInState, getNearbyResorts } from '@/lib/utils/related-resorts';
import { resortService } from '@/lib/api/resort-service';
import { adaptResortFromSupabase } from '@/lib/api/supabase-resort-adapter';
import { getStateName } from '@/lib/data/geo-mappings';

interface RelatedResortsSectionProps {
  resort: Resort;
}

export async function RelatedResortsSection({ resort }: RelatedResortsSectionProps) {
  // Fetch all resorts for comparison
  const response = await resortService.getAllResorts();
  const allResorts = response.data
    .filter((r) => r.isActive)
    .map((r) => r); // Already adapted

  // Get nearby resorts (within 100 miles)
  const nearbyResorts = getNearbyResorts(resort, allResorts, 100, 3);

  // Get more resorts in the same state (excluding those already in nearby)
  const nearbyIds = new Set(nearbyResorts.map((r) => r.id));
  const stateResorts = getResortsInState(resort, allResorts, 6)
    .filter((r) => !nearbyIds.has(r.id))
    .slice(0, 3);

  const stateName = resort.stateCode ? getStateName(resort.stateCode) : '';

  return (
    <div className="space-y-6">
      {nearbyResorts.length > 0 && (
        <RelatedResorts
          currentResort={resort}
          relatedResorts={nearbyResorts}
          title="Nearby Resorts"
        />
      )}
      {stateResorts.length > 0 && (
        <RelatedResorts
          currentResort={resort}
          relatedResorts={stateResorts}
          title={`More Resorts in ${stateName}`}
        />
      )}
    </div>
  );
}
