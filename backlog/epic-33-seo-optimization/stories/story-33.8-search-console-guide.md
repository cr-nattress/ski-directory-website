# Story 33.8: Create Google Search Console Setup Guide

## Priority: Low

## Context

Google Search Console is essential for monitoring SEO performance, indexing status, and search queries. A setup guide ensures proper configuration and ongoing monitoring.

## Current State

- No documentation for Search Console setup
- Unknown if site is verified in Search Console
- No process for monitoring indexing issues

## Requirements

1. Create documentation for Search Console setup
2. Document verification methods
3. Outline key reports to monitor
4. Create checklist for regular SEO maintenance

## Implementation

### Create Documentation

```markdown
# docs/SEARCH_CONSOLE_SETUP.md

# Google Search Console Setup Guide

## 1. Site Verification

### Option A: DNS TXT Record (Recommended)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://skidirectory.org`
3. Choose "Domain" property type
4. Copy the TXT record value
5. Add to DNS settings in domain registrar
6. Verify in Search Console

### Option B: HTML Meta Tag
1. Choose "URL prefix" property type
2. Copy the meta tag
3. Add to `app/layout.tsx`:
   ```tsx
   <meta name="google-site-verification" content="YOUR_CODE" />
   ```
4. Deploy and verify

## 2. Submit Sitemap

1. Go to Sitemaps section
2. Enter: `sitemap.xml`
3. Submit
4. Verify status shows "Success"

## 3. Key Reports to Monitor

### Coverage Report
- Check weekly for indexing issues
- Monitor "Excluded" pages for unexpected exclusions
- Fix "Error" pages immediately

### Performance Report
- Track clicks, impressions, CTR, position
- Filter by page to identify top performers
- Monitor for ranking drops

### Core Web Vitals Report
- Review mobile and desktop separately
- Address "Poor" URLs first
- Track improvements over time

### Mobile Usability
- Ensure all pages are mobile-friendly
- Fix any usability issues flagged

## 4. Regular Maintenance Checklist

### Weekly
- [ ] Check Coverage report for new errors
- [ ] Review Performance for ranking changes
- [ ] Check for manual actions

### Monthly
- [ ] Review Core Web Vitals trends
- [ ] Analyze top search queries
- [ ] Check mobile usability
- [ ] Review sitemap status

### After Deployments
- [ ] Request indexing for new pages
- [ ] Verify no new errors in Coverage
- [ ] Test robots.txt changes

## 5. URL Inspection Tool

Use for:
- Checking if a page is indexed
- Viewing the rendered HTML Google sees
- Requesting immediate indexing
- Debugging indexing issues

## 6. Alerts Setup

Enable email alerts for:
- Coverage issues
- Manual actions
- Security issues

Settings > Email preferences > Enable all notifications

## 7. Linking GA4 and Search Console

1. In GA4: Admin > Product Links > Search Console Links
2. Select the Search Console property
3. Link to connect data
4. Access Search Console data in GA4 reports
```

## Acceptance Criteria

- [ ] Documentation created in docs/ folder
- [ ] Verification steps documented
- [ ] Key reports explained
- [ ] Maintenance checklist included
- [ ] Team has access to Search Console

## Testing

1. Follow guide to verify site (if not done)
2. Submit sitemap
3. Verify initial crawl completes
4. Review first coverage report

## Effort: Small (1 hour documentation)
