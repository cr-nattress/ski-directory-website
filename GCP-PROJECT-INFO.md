# GCP Project Configuration - Ski Directory Assets

This document contains the configuration details for the GCP Cloud Storage infrastructure set up for the Ski Directory application.

## Project Details

| Property | Value |
|----------|-------|
| **Project ID** | `ski-directory-prod` |
| **Project Name** | Ski Directory |
| **Billing Account** | `013EBF-506F6A-99C56A` (Primary) |
| **Owner Account** | `cnattress@gmail.com` |
| **Created** | November 28, 2025 |

## Storage Bucket

| Property | Value |
|----------|-------|
| **Bucket Name** | `sda-assets-prod` |
| **Full URI** | `gs://sda-assets-prod` |
| **Location** | US (multi-region) |
| **Storage Class** | STANDARD (transitions to NEARLINE after 30 days) |
| **Access Control** | Uniform bucket-level access |
| **Versioning** | Enabled |
| **Public Access** | Enabled (allUsers can read) |

## Public URL Pattern

```
https://storage.googleapis.com/sda-assets-prod/resorts/{country}/{state}/{slug}/{path}
```

### Examples
- `https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/assets.json`
- `https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/images/hero.jpg`
- `https://storage.googleapis.com/sda-assets-prod/resorts/us/utah/park-city/trailmaps/2024-map.pdf`

## Folder Structure Convention

```
resorts/{country}/{state}/{slug}/
├── assets.json           # Manifest of all resort assets
├── images/               # Resort photos
├── trailmaps/            # Trail map images/PDFs
├── logos/                # Resort logos
├── docs/                 # Documents (guides, policies)
├── data/                 # Data files (JSON, CSV)
└── originals/            # Original high-res source files
```

## IAM Configuration

### Public Access
- **Member**: `allUsers`
- **Role**: `roles/storage.objectViewer`
- **Purpose**: Anonymous read access for website delivery

### Admin Service Account
- **Email**: `assets-admin@ski-directory-prod.iam.gserviceaccount.com`
- **Role**: `roles/storage.objectAdmin`
- **Purpose**: Upload, update, and manage assets programmatically

## CORS Configuration

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "responseHeader": ["Content-Type", "Cache-Control"],
    "maxAgeSeconds": 3600
  }
]
```

## Lifecycle Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Storage Class Transition | Age > 30 days | Move to NEARLINE |
| Version Cleanup | > 5 newer versions | Delete old version |

## Cache-Control Headers

| File Type | Cache-Control | TTL |
|-----------|---------------|-----|
| Images, Trail Maps, Logos | `public, max-age=31536000, immutable` | 1 year |
| JSON manifests/data | `public, max-age=300` | 5 minutes |

### Setting Cache-Control (Commands)

```bash
# Long-lived for static binaries (immutable)
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  "gs://sda-assets-prod/resorts/**/images/**" \
  "gs://sda-assets-prod/resorts/**/trailmaps/**" \
  "gs://sda-assets-prod/resorts/**/logos/**"

# Short-lived for JSON manifests/data (fast refresh)
gsutil -m setmeta -h "Cache-Control:public, max-age=300" \
  "gs://sda-assets-prod/resorts/**/assets.json" \
  "gs://sda-assets-prod/resorts/**/data/*.json"
```

## Common Commands

### Switch to this project
```bash
gcloud config set project ski-directory-prod
```

### Upload files
```bash
# Single file
gsutil cp local-file.jpg gs://sda-assets-prod/resorts/us/colorado/vail/images/

# Directory (recursive)
gsutil -m rsync -r ./local-resorts gs://sda-assets-prod/resorts
```

### List bucket contents
```bash
gsutil ls -r gs://sda-assets-prod/resorts/
```

### Check bucket configuration
```bash
gcloud storage buckets describe gs://sda-assets-prod
gsutil cors get gs://sda-assets-prod
gsutil lifecycle get gs://sda-assets-prod
```

### Verify public access
```bash
curl -I "https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/assets.json"
```

## Website Integration

### Helper Function (TypeScript)
```typescript
const ASSETS_BUCKET = 'sda-assets-prod';

export const getAssetUrl = (
  country: string,
  state: string,
  slug: string,
  path: string
): string =>
  `https://storage.googleapis.com/${ASSETS_BUCKET}/resorts/${country}/${state}/${slug}/${path}`;

// Usage
const heroImage = getAssetUrl('us', 'colorado', 'vail', 'images/hero.jpg');
const trailMap = getAssetUrl('us', 'colorado', 'vail', 'trailmaps/2024-map.pdf');
const manifest = getAssetUrl('us', 'colorado', 'vail', 'assets.json');
```

### Environment Variable
```env
NEXT_PUBLIC_ASSETS_BUCKET=sda-assets-prod
NEXT_PUBLIC_ASSETS_BASE_URL=https://storage.googleapis.com/sda-assets-prod
```

## Security Notes

1. **Public Bucket**: Everything in `sda-assets-prod` is publicly accessible. Never store:
   - User data or PII
   - Credentials or API keys
   - Internal documents
   - Anything sensitive

2. **Service Account**:
   - Use `assets-admin` only for administrative tools
   - Prefer Workload Identity Federation over key files for CI/CD
   - For local development, use Application Default Credentials (ADC)

3. **Key File** (if generated):
   - Store in CI secret manager
   - Never commit to repository
   - Add to `.gitignore`

## Resort Data API (Migrated 2025-11-28)

All US and Canadian ski resort data has been migrated to GCS under the `/resorts` path.

### Master Index
```
https://storage.googleapis.com/sda-assets-prod/resorts/index.json
```
Returns: List of countries with state counts and resort totals

### Country Index
```
https://storage.googleapis.com/sda-assets-prod/resorts/{country}/index.json
```
Examples:
- `https://storage.googleapis.com/sda-assets-prod/resorts/us/index.json`
- `https://storage.googleapis.com/sda-assets-prod/resorts/ca/index.json`

Returns: List of states/provinces with resort counts

### State/Province Data
```
https://storage.googleapis.com/sda-assets-prod/resorts/{country}/{state}/region.json
https://storage.googleapis.com/sda-assets-prod/resorts/{country}/{state}/resorts.json
```
Examples:
- `https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/region.json`
- `https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/resorts.json`

### Individual Resort Data
```
https://storage.googleapis.com/sda-assets-prod/resorts/{country}/{state}/resorts/{slug}.json
```
Example:
- `https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/resorts/vail.json`

### Migration Statistics
| Metric | Value |
|--------|-------|
| Total Countries | 2 (US, Canada) |
| Total States/Provinces | 49 |
| Total Resorts | 868 |
| US Resorts | 678 |
| Canadian Resorts | 190 |

### Cache Control
| File Type | Cache-Control |
|-----------|---------------|
| `index.json` files | `public, max-age=60` (1 minute) |
| Region/Resort JSON | `public, max-age=300` (5 minutes) |

### Migration Tool
The migration tool is located at `tools/migrate-regions/`:

```bash
# Migrate a specific state
cd tools/migrate-regions
npx ts-node src/index.ts --state colorado --country us

# Migrate all regions
npx ts-node src/index.ts --all

# Dry run (no actual uploads)
npx ts-node src/index.ts --all --dry-run
```

## Future Enhancements

- [x] ~~Build migration CLI tool for batch uploads with image processing~~ (Completed)
- [ ] Add Cloud CDN for better caching and custom domain support
- [ ] Implement signed URLs for premium/gated content
- [ ] Add Cloud Armor for DDoS protection if needed

## Related Files

- `GCP-SETUP.md` - Step-by-step setup guide
- `gcp/cors.json` - CORS configuration file
- `gcp/lifecycle.json` - Lifecycle rules configuration file
- `tools/migrate-regions/` - Migration CLI tool for region data
