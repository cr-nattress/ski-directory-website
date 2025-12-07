# Story 44.7: Lighthouse PWA Audit & Fixes

## Description

Run Lighthouse PWA audit and fix any issues to achieve a passing PWA score. Document the testing process for ongoing validation.

## Acceptance Criteria

- [ ] Lighthouse PWA audit score > 90
- [ ] All "Installable" criteria passing
- [ ] All "PWA Optimized" criteria passing
- [ ] Documented testing process
- [ ] No regressions in performance or accessibility

## Technical Details

### Lighthouse PWA Criteria

#### Installable (Required)

| Check | Requirement | Status |
|-------|-------------|--------|
| Uses HTTPS | Site served over HTTPS | Netlify handles |
| Has web manifest | Valid manifest linked | Story 44.1 |
| Has service worker | SW registered and controlling | Story 44.2-44.3 |
| Has 192px icon | At least one 192x192 icon | Story 44.1 |
| Has 512px icon | At least one 512x512 icon | Story 44.1 |

#### PWA Optimized (Best Practices)

| Check | Requirement | How to Fix |
|-------|-------------|------------|
| Redirects HTTP to HTTPS | All traffic on HTTPS | Netlify handles |
| Configured for custom splash screen | Manifest has name, icons, colors | Story 44.1 |
| Sets theme-color meta tag | `<meta name="theme-color">` | Story 44.1 |
| Content sized correctly for viewport | No horizontal scroll | Already done |
| Has apple-touch-icon | Link in head | Story 44.1 |
| Provides offline fallback | Returns 200 when offline | Story 44.5 |
| Maskable icon | Icon with `purpose: maskable` | Story 44.1 |

### Common Issues & Fixes

#### Issue: "Does not register a service worker"

**Cause:** SW not found at expected path
**Fix:** Ensure `public/service-worker.js` exists and is deployed

#### Issue: "Web app manifest does not meet installability requirements"

**Cause:** Missing required manifest fields
**Fix:** Verify manifest has: `name`, `short_name`, `start_url`, `display`, `icons`

#### Issue: "Does not redirect HTTP to HTTPS"

**Cause:** Netlify misconfiguration
**Fix:** Enable "Force HTTPS" in Netlify site settings

#### Issue: "Page does not have the HTML doctype"

**Cause:** Offline page missing doctype
**Fix:** Ensure `offline.html` starts with `<!DOCTYPE html>`

#### Issue: "Maskable icon not provided"

**Cause:** Icons missing `purpose: maskable`
**Fix:** Add `"purpose": "maskable any"` to icon entries

### Testing Process

#### Local Testing

```bash
# 1. Build production
cd apps/v1
npm run build

# 2. Start production server
npm start

# 3. Open Chrome, navigate to http://localhost:3000

# 4. Open DevTools > Lighthouse
# 5. Check "Progressive Web App" category
# 6. Click "Analyze page load"
```

#### DevTools Checks

1. **Application > Manifest**
   - Verify manifest loaded
   - Check all icons display
   - Verify colors and names

2. **Application > Service Workers**
   - Status should be "activated and running"
   - Source should be `/service-worker.js`

3. **Application > Cache Storage**
   - Verify static cache populated
   - Check app shell files cached

4. **Network > Offline**
   - Enable offline mode
   - Navigate to cached pages (should work)
   - Navigate to uncached pages (should show offline.html)

#### Production Testing

```bash
# Run Lighthouse CLI on production
npx lighthouse https://skidirectory.org --only-categories=pwa --output=html --output-path=./lighthouse-pwa-report.html
```

### Checklist

#### Pre-Audit
- [ ] Deploy to Netlify preview
- [ ] Verify HTTPS working
- [ ] Clear browser cache and SW

#### Audit
- [ ] Run Lighthouse PWA audit
- [ ] Screenshot results
- [ ] Note any failures

#### Fix
- [ ] Address each failing criterion
- [ ] Re-deploy
- [ ] Re-audit

#### Document
- [ ] Record final score
- [ ] Add testing instructions to README

## Expected Lighthouse Output

```
Performance:    XX
Accessibility:  XX
Best Practices: XX
SEO:           XX
PWA:           100 ← Target

✅ Installable
✅ PWA Optimized
```

## Tasks

1. [ ] Run initial Lighthouse PWA audit
2. [ ] Document baseline score
3. [ ] Fix any failing criteria
4. [ ] Re-run audit until passing
5. [ ] Add PWA testing section to README
6. [ ] Create GitHub issue template for PWA regression reports

## Effort

2 story points (Small)

## Notes

- Lighthouse must be run in Incognito for accurate results
- Clear cache between tests
- Some checks require HTTPS (use Netlify preview)
- iOS Safari doesn't support all PWA features (expected)
