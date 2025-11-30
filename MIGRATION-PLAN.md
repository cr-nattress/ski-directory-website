# Epic 14: Resort Data Migration to GCP Cloud Storage

## Overview

This plan migrates all ski resort assets from local storage and external URLs to GCP Cloud Storage (`gs://sda-assets-prod`), establishing a consistent, scalable asset management system.

## Current State Analysis

### Data Location
- **Resort Data**: `apps/v1/lib/mock-data/resorts.ts` (76 resorts: 75 Colorado, 1 Wyoming)
- **Type Definitions**: `apps/v1/lib/mock-data/types.ts`
- **Local Images**: `apps/v1/public/images/` (10 files)

### Current Image Sources

| Source | Count | Description |
|--------|-------|-------------|
| Local files | 10 | Listing cards and trail maps in `/public/images/` |
| Unsplash URLs | ~70 | External URLs with `?w=800` or `?w=1200` params |

### Local Image Inventory

```
apps/v1/public/images/
├── vail-listing.jpg
├── vail-trailmap.jpg
├── breckenridge-listing.jpg
├── breckenridge-trailmap.jpg
├── aspen-snowmass-listing.jpg
├── aspen-snowmass-trailmap.jpg
├── steamboat-listing.jpg
├── steamboat-town-mtn.jpg
├── crestedbutte-listing.jpg
└── beavercreek-listing.jpg
```

### Target GCS Structure

```
gs://sda-assets-prod/resorts/us/colorado/{slug}/
├── assets.json           # Manifest of all resort assets
├── images/
│   ├── hero.jpg          # Hero/banner image
│   ├── card.jpg          # Card listing image
│   └── gallery/          # Additional photos
├── trailmaps/
│   └── current.jpg       # Current season trail map
├── logos/
│   └── primary.png       # Resort logo
└── data/
    └── resort.json       # Full resort data export
```

---

## Migration Phases

### Phase 1: Asset Preparation (Local)

#### Story 14.1: Create Local Staging Directory Structure

**Objective**: Organize existing local assets into the target folder structure before upload.

**Tasks**:
1. Create staging directory: `migration/resorts/`
2. Copy and rename existing local images to match convention
3. Verify all files are in correct locations

**Mapping**:
| Current File | Target Path |
|--------------|-------------|
| `vail-listing.jpg` | `resorts/us/colorado/vail/images/card.jpg` |
| `vail-trailmap.jpg` | `resorts/us/colorado/vail/trailmaps/current.jpg` |
| `breckenridge-listing.jpg` | `resorts/us/colorado/breckenridge/images/card.jpg` |
| `breckenridge-trailmap.jpg` | `resorts/us/colorado/breckenridge/trailmaps/current.jpg` |
| `aspen-snowmass-listing.jpg` | `resorts/us/colorado/snowmass/images/card.jpg` |
| `aspen-snowmass-trailmap.jpg` | `resorts/us/colorado/snowmass/trailmaps/current.jpg` |
| `steamboat-listing.jpg` | `resorts/us/colorado/steamboat/images/card.jpg` |
| `steamboat-town-mtn.jpg` | `resorts/us/colorado/steamboat/images/hero.jpg` |
| `crestedbutte-listing.jpg` | `resorts/us/colorado/crested-butte/images/card.jpg` |
| `beavercreek-listing.jpg` | `resorts/us/colorado/beaver-creek/images/card.jpg` |

**Commands**:
```powershell
# Create staging structure
$resorts = @("vail", "breckenridge", "snowmass", "steamboat", "crested-butte", "beaver-creek")
foreach ($resort in $resorts) {
    New-Item -ItemType Directory -Force -Path "migration/resorts/us/colorado/$resort/images"
    New-Item -ItemType Directory -Force -Path "migration/resorts/us/colorado/$resort/trailmaps"
}

# Copy and rename files
Copy-Item "apps/v1/public/images/vail-listing.jpg" "migration/resorts/us/colorado/vail/images/card.jpg"
Copy-Item "apps/v1/public/images/vail-trailmap.jpg" "migration/resorts/us/colorado/vail/trailmaps/current.jpg"
# ... etc
```

---

#### Story 14.2: Generate Asset Manifests

**Objective**: Create `assets.json` manifest files for each resort with local assets.

**Schema**:
```json
{
  "slug": "vail",
  "country": "us",
  "state": "colorado",
  "lastUpdated": "2025-11-28T00:00:00Z",
  "images": {
    "card": {
      "url": "images/card.jpg",
      "width": 800,
      "height": 600,
      "contentType": "image/jpeg"
    },
    "hero": {
      "url": "images/hero.jpg",
      "width": 1200,
      "height": 800,
      "contentType": "image/jpeg"
    }
  },
  "trailMaps": {
    "current": {
      "url": "trailmaps/current.jpg",
      "width": 1200,
      "height": 900,
      "contentType": "image/jpeg",
      "season": "2024-2025"
    }
  },
  "logos": {},
  "totalAssets": 3
}
```

**Tasks**:
1. Create manifest template
2. Generate manifest for each resort with local assets
3. Include image metadata (dimensions, content type)

---

### Phase 2: Upload to GCS

#### Story 14.3: Upload Local Assets to Bucket

**Objective**: Sync all prepared local assets to GCS bucket.

**Commands**:
```bash
# Ensure correct project
gcloud config set project ski-directory-prod

# Upload with parallel transfers
gsutil -m rsync -r "./migration/resorts" "gs://sda-assets-prod/resorts"

# Verify upload
gsutil ls -r gs://sda-assets-prod/resorts/
```

**Expected Result**:
```
gs://sda-assets-prod/resorts/us/colorado/vail/
  assets.json
  images/card.jpg
  trailmaps/current.jpg
gs://sda-assets-prod/resorts/us/colorado/breckenridge/
  assets.json
  images/card.jpg
  trailmaps/current.jpg
... etc
```

---

#### Story 14.4: Set Content Types and Cache Headers

**Objective**: Configure proper metadata for all uploaded assets.

**Commands**:
```bash
# Set content types
gsutil -m setmeta -h "Content-Type:image/jpeg" "gs://sda-assets-prod/resorts/**/*.jpg"
gsutil -m setmeta -h "Content-Type:application/json" "gs://sda-assets-prod/resorts/**/assets.json"

# Set cache headers - long cache for images
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  "gs://sda-assets-prod/resorts/**/images/**" \
  "gs://sda-assets-prod/resorts/**/trailmaps/**" \
  "gs://sda-assets-prod/resorts/**/logos/**"

# Short cache for JSON manifests
gsutil -m setmeta -h "Cache-Control:public, max-age=300" \
  "gs://sda-assets-prod/resorts/**/assets.json" \
  "gs://sda-assets-prod/resorts/**/data/**"
```

---

#### Story 14.5: Verify Public URL Access

**Objective**: Confirm all assets are publicly accessible.

**Test URLs**:
```bash
# Test image access
curl -I "https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/images/card.jpg"

# Expected headers:
# HTTP/1.1 200 OK
# Content-Type: image/jpeg
# Cache-Control: public, max-age=31536000, immutable
# Access-Control-Allow-Origin: *

# Test manifest access
curl "https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/assets.json"
```

---

### Phase 3: Application Integration

#### Story 14.6: Create Asset URL Helper Utilities

**Objective**: Add helper functions to construct GCS URLs in the application.

**File**: `apps/v1/lib/gcs-assets.ts`

```typescript
const GCS_BUCKET = 'sda-assets-prod';
const GCS_BASE_URL = `https://storage.googleapis.com/${GCS_BUCKET}`;

export interface AssetPath {
  country: string;
  state: string;
  slug: string;
}

/**
 * Get the base URL for a resort's assets
 */
export function getResortAssetBase(resort: AssetPath): string {
  return `${GCS_BASE_URL}/resorts/${resort.country}/${resort.state}/${resort.slug}`;
}

/**
 * Get a specific asset URL for a resort
 */
export function getResortAssetUrl(resort: AssetPath, path: string): string {
  return `${getResortAssetBase(resort)}/${path}`;
}

/**
 * Get the card image URL for a resort
 */
export function getCardImageUrl(resort: AssetPath): string {
  return getResortAssetUrl(resort, 'images/card.jpg');
}

/**
 * Get the hero image URL for a resort
 */
export function getHeroImageUrl(resort: AssetPath): string {
  return getResortAssetUrl(resort, 'images/hero.jpg');
}

/**
 * Get the trail map URL for a resort
 */
export function getTrailMapUrl(resort: AssetPath): string {
  return getResortAssetUrl(resort, 'trailmaps/current.jpg');
}

/**
 * Get the assets manifest URL for a resort
 */
export function getAssetsManifestUrl(resort: AssetPath): string {
  return getResortAssetUrl(resort, 'assets.json');
}

// Convenience for Colorado resorts (most common)
export function getColoradoResortAssetUrl(slug: string, path: string): string {
  return getResortAssetUrl({ country: 'us', state: 'colorado', slug }, path);
}
```

---

#### Story 14.7: Update Resort Data Model

**Objective**: Add GCS location fields to Resort type.

**File**: `apps/v1/lib/mock-data/types.ts`

```typescript
// Add to Resort interface
interface Resort {
  // ... existing fields ...

  // GCS asset location (new)
  assetLocation?: {
    country: string;  // 'us'
    state: string;    // 'colorado'
    slug: string;     // matches resort slug
  };

  // Flag indicating assets are hosted on GCS
  hasGcsAssets?: boolean;
}
```

---

#### Story 14.8: Update Resort Data with GCS References

**Objective**: Update resorts.ts to use GCS URLs for resorts with uploaded assets.

**Before**:
```typescript
{
  slug: 'vail',
  heroImage: '/images/vail-listing.jpg',
  trailMapUrl: '/images/vail-trailmap.jpg',
  images: [
    { url: '/images/vail-listing.jpg', isCardImage: true, ... }
  ]
}
```

**After**:
```typescript
{
  slug: 'vail',
  assetLocation: { country: 'us', state: 'colorado', slug: 'vail' },
  hasGcsAssets: true,
  heroImage: 'https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/images/hero.jpg',
  trailMapUrl: 'https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/trailmaps/current.jpg',
  images: [
    {
      url: 'https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/images/card.jpg',
      isCardImage: true,
      isHeroImage: false,
      alt: 'Vail ski resort',
      priority: 1
    }
  ]
}
```

**Resorts to Update** (those with local assets):
1. vail
2. breckenridge
3. snowmass (using aspen-snowmass images)
4. steamboat
5. crested-butte
6. beaver-creek

---

#### Story 14.9: Create Image Component with GCS Fallback

**Objective**: Create a React component that handles GCS images with fallback.

**File**: `apps/v1/components/ui/resort-image.tsx`

```typescript
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ResortImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function ResortImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder-resort.jpg',
  width,
  height,
  className,
  priority = false,
}: ResortImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Use unoptimized for external GCS URLs
  const isExternal = imgSrc.startsWith('https://');

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
      unoptimized={isExternal}
    />
  );
}
```

---

### Phase 4: Verification and Cleanup

#### Story 14.10: End-to-End Testing

**Objective**: Verify the migration works correctly in the application.

**Test Cases**:
1. [ ] Resort cards display GCS images correctly
2. [ ] Resort detail pages show GCS hero images
3. [ ] Trail maps load from GCS
4. [ ] Fallback works when GCS asset is missing
5. [ ] No CORS errors in browser console
6. [ ] Images cached properly (check Network tab)

**Manual Testing**:
```bash
# Start dev server
cd apps/v1
npm run dev

# Visit pages with migrated resorts:
# http://localhost:3000/colorado/vail
# http://localhost:3000/colorado/breckenridge
# http://localhost:3000/colorado/steamboat
```

---

#### Story 14.11: Remove Local Assets (Optional)

**Objective**: After successful migration, remove local copies.

**Tasks**:
1. Verify all GCS assets are working
2. Update any remaining local URL references
3. Delete files from `apps/v1/public/images/`
4. Keep backup of deleted files

**Commands**:
```powershell
# Create backup first
Copy-Item -Recurse "apps/v1/public/images" "backup/public-images-$(Get-Date -Format 'yyyyMMdd')"

# After verification, remove local files
Remove-Item "apps/v1/public/images/vail-*.jpg"
Remove-Item "apps/v1/public/images/breckenridge-*.jpg"
# ... etc
```

---

#### Story 14.12: Update Documentation

**Objective**: Document the new asset management approach.

**Files to Update**:
1. `CLAUDE.md` - Add GCS asset section
2. `GCP-PROJECT-INFO.md` - Add migration status
3. `README.md` - Update architecture overview

---

## Migration Summary

### Files to Migrate

| Resort | Card Image | Trail Map | Hero Image |
|--------|------------|-----------|------------|
| Vail | ✅ | ✅ | - |
| Breckenridge | ✅ | ✅ | - |
| Snowmass | ✅ | ✅ | - |
| Steamboat | ✅ | - | ✅ |
| Crested Butte | ✅ | - | - |
| Beaver Creek | ✅ | - | - |

**Total**: 10 files → 6 resort folders

### New Files to Create

| File | Purpose |
|------|---------|
| `apps/v1/lib/gcs-assets.ts` | URL helper utilities |
| `apps/v1/components/ui/resort-image.tsx` | Image component with fallback |
| `migration/resorts/` | Local staging directory |

### Files to Update

| File | Changes |
|------|---------|
| `apps/v1/lib/mock-data/types.ts` | Add `assetLocation` and `hasGcsAssets` fields |
| `apps/v1/lib/mock-data/resorts.ts` | Update image URLs for 6 resorts |

---

## Execution Order

1. **Phase 1**: Prepare local assets (Stories 14.1-14.2)
2. **Phase 2**: Upload to GCS (Stories 14.3-14.5)
3. **Phase 3**: Integrate with app (Stories 14.6-14.9)
4. **Phase 4**: Test and cleanup (Stories 14.10-14.12)

---

## Rollback Plan

If issues occur after migration:

1. **Quick Rollback**: Revert image URLs in `resorts.ts` to local paths
2. **Full Rollback**: Restore `public/images/` from backup
3. **GCS Cleanup**: `gsutil -m rm -r gs://sda-assets-prod/resorts/`

---

## Future Enhancements

After initial migration:

1. **Download Unsplash images** - Host all images on GCS instead of external URLs
2. **Image optimization** - Generate WebP/AVIF variants with `sharp`
3. **Responsive images** - Create 600/1200/1600px variants
4. **CDN layer** - Add Cloud CDN with custom domain
5. **CLI tool** - Build asset management CLI per Epic 13.11

---

## Cost Estimate

GCS Storage costs (US multi-region):
- **Storage**: $0.026/GB/month (Standard), $0.01/GB (Nearline after 30 days)
- **Operations**: $0.005 per 10,000 Class B operations (reads)
- **Egress**: Free within GCP, $0.12/GB to internet

**For ~10MB of images**:
- Monthly storage: ~$0.01
- Typical egress (1000 page views): ~$0.01
- **Total estimated**: < $1/month
