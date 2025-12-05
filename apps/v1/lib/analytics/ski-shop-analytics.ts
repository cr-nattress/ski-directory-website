/**
 * Analytics tracking for ski shop interactions
 * Uses Google Analytics 4 gtag events
 *
 * Note: Window.gtag type is defined in types/gtag.d.ts
 */

/**
 * Track when a user clicks the Call button
 */
export function trackSkiShopCall(
  shopName: string,
  resortName: string,
  distance: number
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shop_call', {
      event_category: 'Ski Shops',
      event_label: shopName,
      resort_name: resortName,
      distance_miles: distance,
    });
  }
}

/**
 * Track when a user clicks Get Directions
 */
export function trackSkiShopDirections(
  shopName: string,
  resortName: string,
  distance: number
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shop_directions', {
      event_category: 'Ski Shops',
      event_label: shopName,
      resort_name: resortName,
      distance_miles: distance,
    });
  }
}

/**
 * Track when a user clicks Visit Website
 */
export function trackSkiShopWebsite(
  shopName: string,
  resortName: string,
  websiteUrl: string
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shop_website', {
      event_category: 'Ski Shops',
      event_label: shopName,
      resort_name: resortName,
      destination_url: websiteUrl,
    });
  }
}

/**
 * Track when ski shops section is viewed/expanded
 */
export function trackSkiShopsView(
  resortName: string,
  shopCount: number,
  source: 'accordion' | 'sidebar' | 'section'
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shops_view', {
      event_category: 'Ski Shops',
      event_label: resortName,
      shop_count: shopCount,
      view_source: source,
    });
  }
}

/**
 * Track "View All Shops" expansion
 */
export function trackSkiShopsExpand(
  resortName: string,
  shopCount: number
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shops_expand', {
      event_category: 'Ski Shops',
      event_label: resortName,
      shop_count: shopCount,
    });
  }
}

/**
 * Track filter usage
 */
export function trackSkiShopsFilter(
  resortName: string,
  filterType: string,
  action: 'add' | 'remove'
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shops_filter', {
      event_category: 'Ski Shops',
      event_label: filterType,
      resort_name: resortName,
      filter_action: action,
    });
  }
}
