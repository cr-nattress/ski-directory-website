# Epic 33: SEO Optimization & Google Analytics Enhancement

## Overview

Comprehensive SEO optimization based on Next.js best practices to maximize Google page ranking. This epic addresses gaps identified from analyzing the `nextjs_seo_guide.docx` against the current implementation.

## Current State Analysis

### Already Implemented
- Dynamic XML Sitemap (`app/sitemap.ts`)
- Metadata API with title templates and descriptions
- Structured Data (JSON-LD) for SkiResort, Organization, Website, Breadcrumbs
- Google Analytics 4 basic installation
- Open Graph and Twitter Card meta tags
- Content Security Policy headers
- Next.js Image optimization
- SSG/SSR rendering strategies

### Gaps Identified
1. **No robots.txt file** - Critical for crawl control
2. **No GA4 page view tracking for SPA navigation** - Missing client-side route change tracking
3. **No custom event tracking** - No user interaction analytics
4. **No Google Search Console integration documentation**
5. **No canonical URL implementation** - Risk of duplicate content issues
6. **No FAQ schema** - Missing rich snippet opportunity for FAQ content
7. **Incomplete internal linking strategy** - No programmatic cross-linking
8. **No Core Web Vitals monitoring dashboard**
9. **Missing hreflang tags** - No internationalization SEO (future-proofing)
10. **No Google Tag Manager** - Limited flexibility for marketing tags

## Stories

| ID | Story | Priority | Effort |
|----|-------|----------|--------|
| 33.1 | Add robots.txt file | High | Small |
| 33.2 | Implement GA4 SPA page view tracking | High | Small |
| 33.3 | Add custom GA4 event tracking | Medium | Medium |
| 33.4 | Implement canonical URLs | High | Small |
| 33.5 | Add FAQ structured data | Medium | Small |
| 33.6 | Implement internal linking component | Medium | Medium |
| 33.7 | Add Core Web Vitals reporting to GA4 | Medium | Small |
| 33.8 | Create Google Search Console setup guide | Low | Small |
| 33.9 | Add meta tags for resort detail pages | High | Small |
| 33.10 | Implement Open Graph images per resort | Low | Medium |

## Success Metrics

- Google Search Console: Improved crawl coverage
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Organic traffic increase (measurable via GA4)
- Rich snippets appearing in search results
- All pages indexed in Google

## Dependencies

- Google Analytics account (already set up: G-JE4S4F12GX)
- Google Search Console access
- Supabase data for dynamic sitemap

## Technical Considerations

- All SEO components should be server-rendered
- Avoid client-side-only meta tag manipulation
- Use Next.js Metadata API for App Router
- Test with Google Rich Results Test tool
- Validate structured data with Schema.org validator

## Reference

Based on `nextjs_seo_guide.docx` - Comprehensive guide for Next.js SEO optimization including:
- Technical SEO Foundation
- On-Page SEO Optimization
- Performance Optimization
- Structured Data and Schema Markup
- Google Analytics 4 Integration
- Google Tag Manager Integration
- Content Strategy for SEO
- Mobile Optimization
- Link Building and Off-Page SEO
- Monitoring and Continuous Improvement
