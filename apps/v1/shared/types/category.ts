/**
 * Category Types
 * Filter categories for resort discovery
 */

import type { Resort } from './resort';

export interface Category {
  id: string;
  label: string;
  icon: string;
  filter: (resort: Resort) => boolean;
}
