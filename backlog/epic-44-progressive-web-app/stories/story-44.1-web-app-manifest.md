# Story 44.1: Web App Manifest & Icons

## Description

Create a web app manifest file and generate the required icon set for PWA installability.

## Acceptance Criteria

- [ ] `public/manifest.webmanifest` created with proper configuration
- [ ] Icon set generated in multiple required sizes
- [ ] Manifest linked in root layout `<head>`
- [ ] Meta tags added for theme-color and apple-touch-icon
- [ ] Lighthouse reports "Has a valid manifest" check passing

## Technical Details

### Manifest File: `public/manifest.webmanifest`

```json
{
  "name": "Ski Directory - Find Your Perfect Resort",
  "short_name": "Ski Directory",
  "description": "Discover 100+ ski resorts across North America. Compare terrain, conditions, and pass info.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F9FAFB",
  "theme_color": "#1E40AF",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["sports", "travel", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshots/home-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/home-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### Required Icon Sizes

| Size | Purpose |
|------|---------|
| 72x72 | Android older devices |
| 96x96 | Android older devices |
| 128x128 | Chrome Web Store |
| 144x144 | Windows tiles |
| 152x152 | iOS home screen |
| 192x192 | Chrome Android (required minimum) |
| 384x384 | Chrome Android splash |
| 512x512 | Chrome Android splash (required) |

### Layout Changes: `app/layout.tsx`

Add to metadata:
```tsx
export const metadata: Metadata = {
  // ... existing metadata
  manifest: '/manifest.webmanifest',
  themeColor: '#1E40AF',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ski Directory',
  },
};
```

### Icon Generation Options

1. **Manual:** Use Figma/Sketch to export from logo.png
2. **Automated:** Use `pwa-asset-generator` npm package
3. **Online:** Use realfavicongenerator.net

## Tasks

1. [ ] Generate icon set from existing logo.png
2. [ ] Create `public/icons/` directory
3. [ ] Create `public/manifest.webmanifest`
4. [ ] Update `app/layout.tsx` metadata
5. [ ] Add apple-touch-icon link tag
6. [ ] Test manifest detection in Chrome DevTools

## Effort

3 story points (Small)

## Notes

- Icons should have transparent background for best results
- Maskable icons need safe zone (inner 80% is visible)
- Consider generating favicon.ico as well
