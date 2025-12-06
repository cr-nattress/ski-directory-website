/**
 * Analytics tracking for dining venue interactions
 * Uses Google Analytics 4 gtag events
 */

/**
 * Track when a user clicks the Call button
 */
export function trackDiningCall(
  venueName: string,
  resortName: string,
  distance: number,
  venueType: string[]
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'dining_call', {
      event_category: 'Dining',
      event_label: venueName,
      resort_name: resortName,
      distance_miles: distance,
      venue_type: venueType.join(','),
    });
  }
}

/**
 * Track when a user clicks Get Directions
 */
export function trackDiningDirections(
  venueName: string,
  resortName: string,
  distance: number,
  venueType: string[]
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'dining_directions', {
      event_category: 'Dining',
      event_label: venueName,
      resort_name: resortName,
      distance_miles: distance,
      venue_type: venueType.join(','),
    });
  }
}

/**
 * Track when a user clicks Visit Website
 */
export function trackDiningWebsite(
  venueName: string,
  resortName: string,
  websiteUrl: string,
  venueType: string[]
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'dining_website', {
      event_category: 'Dining',
      event_label: venueName,
      resort_name: resortName,
      destination_url: websiteUrl,
      venue_type: venueType.join(','),
    });
  }
}

/**
 * Track when dining section is viewed/expanded
 */
export function trackDiningView(
  resortName: string,
  venueCount: number,
  source: 'accordion' | 'sidebar' | 'section'
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'dining_view', {
      event_category: 'Dining',
      event_label: resortName,
      venue_count: venueCount,
      view_source: source,
    });
  }
}

/**
 * Track "View All" expansion
 */
export function trackDiningExpand(
  resortName: string,
  venueCount: number
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'dining_expand', {
      event_category: 'Dining',
      event_label: resortName,
      venue_count: venueCount,
    });
  }
}

/**
 * Track filter usage
 */
export function trackDiningFilter(
  resortName: string,
  filterType: string,
  filterValue: string,
  action: 'add' | 'remove'
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'dining_filter', {
      event_category: 'Dining',
      event_label: filterType,
      resort_name: resortName,
      filter_value: filterValue,
      filter_action: action,
    });
  }
}

/**
 * Track map pin click
 */
export function trackDiningMapPinClick(
  venueName: string,
  resortName: string,
  venueType: string[]
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'dining_map_pin_click', {
      event_category: 'Dining',
      event_label: venueName,
      resort_name: resortName,
      venue_type: venueType.join(','),
    });
  }
}

/**
 * Track sort change
 */
export function trackDiningSort(
  resortName: string,
  sortBy: string
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'dining_sort', {
      event_category: 'Dining',
      event_label: sortBy,
      resort_name: resortName,
    });
  }
}
