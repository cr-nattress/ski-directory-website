# Google Search Console Setup Guide

This guide covers setting up and maintaining Google Search Console for skidirectory.org.

## 1. Site Verification

### Option A: DNS TXT Record (Recommended)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://skidirectory.org`
3. Choose "Domain" property type
4. Copy the TXT record value provided
5. Add to DNS settings in your domain registrar
6. Wait for DNS propagation (can take up to 48 hours)
7. Return to Search Console and click "Verify"

### Option B: HTML Meta Tag

1. Choose "URL prefix" property type for `https://skidirectory.org`
2. Copy the meta tag verification code
3. Add to `apps/v1/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  // ... existing metadata
  verification: {
    google: 'YOUR_VERIFICATION_CODE',
  },
};
```

4. Deploy the changes
5. Return to Search Console and verify

## 2. Submit Sitemap

1. In Search Console, navigate to **Sitemaps** (left sidebar)
2. Enter `sitemap.xml` in the "Add a new sitemap" field
3. Click **Submit**
4. Verify status shows "Success"

The sitemap is dynamically generated at:
- URL: `https://skidirectory.org/sitemap.xml`
- Source: `apps/v1/app/sitemap.ts`

## 3. Key Reports to Monitor

### Coverage Report (Indexing > Pages)

**Check weekly for:**
- **Not indexed** pages - investigate why Google isn't indexing them
- **Crawled - currently not indexed** - may need content improvements
- **Discovered - not indexed** - Google knows about but hasn't crawled

**Action items:**
- Fix any pages with crawl errors
- Ensure important pages are not excluded
- Check robots.txt isn't blocking important content

### Performance Report (Performance > Search Results)

**Key metrics:**
- **Clicks** - Users clicking through from search
- **Impressions** - Times your pages appeared in search
- **CTR** - Click-through rate (clicks / impressions)
- **Position** - Average ranking position

**Use filters to analyze:**
- By Query - see which search terms drive traffic
- By Page - identify top/underperforming pages
- By Country - understand geographic distribution
- By Device - compare mobile vs desktop

### Core Web Vitals Report

**Location:** Experience > Core Web Vitals

**Monitor:**
- LCP (Largest Contentful Paint) - Target: < 2.5s
- INP (Interaction to Next Paint) - Target: < 200ms
- CLS (Cumulative Layout Shift) - Target: < 0.1

**Action items:**
- Address "Poor" URLs immediately
- Review "Needs improvement" URLs
- Track improvements over time

### Mobile Usability

**Location:** Experience > Mobile Usability

**Check for:**
- Text too small to read
- Clickable elements too close together
- Content wider than screen

## 4. Regular Maintenance Checklist

### Weekly

- [ ] Check Coverage report for new errors
- [ ] Review Performance report for ranking changes
- [ ] Look for manual actions (Security & Manual Actions)
- [ ] Monitor Core Web Vitals for regressions

### Monthly

- [ ] Analyze top search queries
- [ ] Review pages with declining traffic
- [ ] Check mobile usability issues
- [ ] Verify sitemap status
- [ ] Review structured data errors

### After Deployments

- [ ] Request indexing for new pages via URL Inspection
- [ ] Verify no new Coverage errors
- [ ] Test robots.txt changes (if any)
- [ ] Validate structured data for new page types

## 5. URL Inspection Tool

Use this tool to:

1. **Check indexing status** - Is the page in Google's index?
2. **View rendered HTML** - See what Google sees
3. **Request indexing** - Prompt Google to crawl a new/updated page
4. **Debug issues** - See mobile usability and structured data

### How to request indexing:

1. Enter the URL in the inspection tool
2. Click "Request Indexing"
3. Wait for confirmation
4. Note: This doesn't guarantee immediate indexing

## 6. Linking GA4 and Search Console

Connecting these tools provides search query data in GA4:

1. In GA4: **Admin > Product Links > Search Console Links**
2. Click **Link**
3. Select the Search Console property for skidirectory.org
4. Click **Confirm**

After linking, access Search Console data in GA4:
- **Reports > Acquisition > Search Console**

## 7. Email Alerts Setup

Enable notifications to stay informed:

1. Go to **Settings** (gear icon)
2. Select **Email preferences**
3. Enable alerts for:
   - Coverage issues
   - Manual actions
   - Security issues
   - Core Web Vitals regressions

## 8. Common Issues & Solutions

### "Crawled - currently not indexed"

**Causes:**
- Thin content
- Duplicate content
- Low-quality pages

**Solutions:**
- Add more unique, valuable content
- Implement canonical URLs (already done)
- Improve internal linking

### "Blocked by robots.txt"

**Causes:**
- Accidentally blocking important pages

**Solutions:**
- Review `public/robots.txt`
- Use URL Inspection tool to test

### "Redirect error"

**Causes:**
- Redirect chains or loops
- Invalid redirect targets

**Solutions:**
- Fix redirect chains to single hops
- Ensure redirect targets are valid

## 9. Useful External Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results) - Validate structured data
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - Check mobile usability
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance analysis
- [Schema.org Validator](https://validator.schema.org/) - Validate JSON-LD markup

## Related Files

- `public/robots.txt` - Crawler directives
- `app/sitemap.ts` - Dynamic sitemap generation
- `components/schema/*.tsx` - Structured data components
- `lib/analytics.ts` - GA4 event tracking
