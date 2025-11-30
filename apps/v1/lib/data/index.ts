/**
 * Static Data Exports
 * Re-exports all static data and utility functions
 */

// Categories
export { categories } from './categories';

// Articles
export { articles } from './articles';

// Ski Links
export {
  skiLinks,
  getSkiLinks,
  getSkiLinksByType,
  filterSkiLinks,
  sortSkiLinks,
  groupSkiLinksByType,
  getSkiLinkStats,
  getFeaturedSkiLinks,
  getDisplayDomain,
} from './ski-links';

// Social Links
export {
  socialLinks,
  getSocialLinks,
  getSocialLinksByPlatform,
  getSocialLinksByTopic,
  filterSocialLinks,
  sortSocialLinks,
  groupSocialLinksByTopic,
  getSocialLinkStats,
  getFeaturedSocialLinks,
  getUniquePlatformCount,
} from './social-links';
