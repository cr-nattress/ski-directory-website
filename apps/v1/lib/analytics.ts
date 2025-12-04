export const GA_MEASUREMENT_ID = 'G-JE4S4F12GX';

type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export const trackEvent = ({ action, category, label, value }: GtagEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackResortClick = (resortName: string, source: string) => {
  trackEvent({
    action: 'resort_click',
    category: 'engagement',
    label: `${resortName} from ${source}`,
  });
};

export const trackViewModeChange = (mode: 'cards' | 'map') => {
  trackEvent({
    action: 'view_mode_change',
    category: 'engagement',
    label: mode,
  });
};

export const trackFilterSelection = (filterType: string, filterValue: string) => {
  trackEvent({
    action: 'filter_select',
    category: 'engagement',
    label: `${filterType}: ${filterValue}`,
  });
};

export const trackExternalLink = (url: string, resortName?: string) => {
  trackEvent({
    action: 'external_link_click',
    category: 'outbound',
    label: resortName ? `${resortName}: ${url}` : url,
  });
};

export const trackSearch = (query: string, resultCount: number) => {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: query,
    value: resultCount,
  });
};

export const trackTrailMapView = (resortName: string) => {
  trackEvent({
    action: 'trail_map_view',
    category: 'engagement',
    label: resortName,
  });
};

export const trackSocialLinkClick = (platform: string, resortName?: string) => {
  trackEvent({
    action: 'social_link_click',
    category: 'outbound',
    label: resortName ? `${resortName}: ${platform}` : platform,
  });
};
