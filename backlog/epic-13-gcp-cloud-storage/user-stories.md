# Epic 13: GCP Cloud Storage Setup for Resort Assets

## Overview
Set up Google Cloud Platform (GCP) Cloud Storage infrastructure for hosting resort assets (images, trail maps, logos, documents). This establishes a single production bucket with public read access for website delivery and admin access for internal tools.

## Business Value
- Enable scalable, globally distributed asset hosting for all resort images and media
- Provide reliable CDN-backed delivery for fast website performance
- Establish secure admin access for asset management tools
- Support future growth with versioning and lifecycle management
- Reduce hosting costs with tiered storage classes

## Technical Context
Based on `GCP-SETUP.md`, the infrastructure includes:
- Single production bucket: `gs://sda-assets-prod`
- US multi-region for low latency across North America
- Uniform bucket-level access for simplified IAM
- Object versioning for recovery and history
- Public read access via `allUsers` policy
- Admin service account with full object management
- CORS configuration for browser access
- Lifecycle rules for cost optimization

## Prerequisites
- Google Cloud project with billing enabled
- Google Cloud SDK installed locally (`gcloud`, `gsutil`)
- IAM permissions to create buckets, bindings, and service accounts

---

# User Stories

## Phase 1: GCP Project Setup

### Story 13.1: Authenticate and Configure GCloud CLI
**As a** developer setting up the infrastructure
**I want** to authenticate and configure the GCloud CLI
**So that** I can execute GCP commands against the correct project

**Tasks:**
1. Run `gcloud auth login` and complete browser authentication
2. Set the project: `gcloud config set project <project-id>`
3. Set up Application Default Credentials: `gcloud auth application-default login`
4. Enable the Cloud Storage API: `gcloud services enable storage.googleapis.com`

**Acceptance Criteria:**
- [ ] Successfully authenticated with GCloud CLI
- [ ] Project ID configured correctly
- [ ] ADC configured for local development
- [ ] Cloud Storage API enabled
- [ ] Can run `gcloud config list` and see correct project

**Commands:**
```bash
gcloud auth login
gcloud config set project <project-id>
gcloud auth application-default login
gcloud services enable storage.googleapis.com
```

---

## Phase 2: Bucket Creation and Configuration

### Story 13.2: Create Production Storage Bucket
**As a** platform administrator
**I want** to create a production storage bucket with proper configuration
**So that** we have a reliable home for all resort assets

**Tasks:**
1. Create bucket `gs://sda-assets-prod` with US multi-region
2. Enable uniform bucket-level access
3. Enable object versioning for recovery

**Acceptance Criteria:**
- [ ] Bucket created successfully (or alternate name if taken)
- [ ] Location set to US multi-region
- [ ] Uniform bucket-level access enabled
- [ ] Object versioning enabled
- [ ] Bucket appears in Cloud Console

**Commands:**
```bash
gcloud storage buckets create gs://sda-assets-prod \
  --project=<project-id> \
  --location=US \
  --uniform-bucket-level-access

gcloud storage buckets update gs://sda-assets-prod --versioning
```

**Notes:**
- Bucket names are globally unique; if `sda-assets-prod` is taken, choose an alternative (e.g., `sda-assets-prod-[random]`)
- US multi-region provides redundancy across US data centers

---

### Story 13.3: Configure Public Read Access
**As a** website visitor
**I want** resort images and assets to load without authentication
**So that** the website displays media quickly and reliably

**Tasks:**
1. Relax Public Access Prevention if organization enforces it
2. Grant `roles/storage.objectViewer` to `allUsers`
3. Verify public access works

**Acceptance Criteria:**
- [ ] Public Access Prevention set to "inherited" (if needed)
- [ ] `allUsers` granted objectViewer role
- [ ] Can access test object via public URL without authentication

**Commands:**
```bash
# If org uses Public Access Prevention
gcloud storage buckets update gs://sda-assets-prod --public-access-prevention=inherited

# Grant public read
gcloud storage buckets add-iam-policy-binding gs://sda-assets-prod \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

**Security Note:**
- Everything in this bucket will be publicly accessible
- Never store sensitive/private content in this bucket
- Use a separate private bucket for any confidential assets

---

### Story 13.4: Create Admin Service Account
**As a** migration/admin tool
**I want** a dedicated service account with write access
**So that** I can upload and manage assets programmatically

**Tasks:**
1. Create service account `assets-admin`
2. Grant `roles/storage.objectAdmin` on the bucket
3. (Optional) Generate JSON key for CI/CD if needed

**Acceptance Criteria:**
- [ ] Service account `assets-admin@<project-id>.iam.gserviceaccount.com` created
- [ ] Service account has objectAdmin role on bucket
- [ ] Key file generated and stored securely (if required)

**Commands:**
```bash
# Create service account
gcloud iam service-accounts create assets-admin --display-name="Assets Admin"

# Grant bucket admin
gcloud storage buckets add-iam-policy-binding gs://sda-assets-prod \
  --member=serviceAccount:assets-admin@<project-id>.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin

# Generate key (only if needed; prefer Workload Identity Federation for CI)
gcloud iam service-accounts keys create assets-admin-key.json \
  --iam-account=assets-admin@<project-id>.iam.gserviceaccount.com
```

**Security Notes:**
- Store key file in CI secret manager, never commit to repo
- Prefer Workload Identity Federation for GitHub Actions/Cloud Build
- For local dev, use Application Default Credentials (no key file)

---

## Phase 3: Bucket Policies

### Story 13.5: Configure CORS for Browser Access
**As a** frontend developer
**I want** CORS configured on the bucket
**So that** the website can load assets via JavaScript

**Tasks:**
1. Create `cors.json` configuration file
2. Apply CORS policy to bucket
3. Verify CORS headers in response

**Acceptance Criteria:**
- [ ] `cors.json` created with correct configuration
- [ ] CORS policy applied to bucket
- [ ] OPTIONS requests return correct CORS headers
- [ ] JavaScript can fetch assets from different origin

**Configuration File (`cors.json`):**
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

**Commands:**
```bash
gcloud storage buckets update gs://sda-assets-prod --cors-file=cors.json
```

**Future Enhancement:**
- Consider restricting origins to production domain for security

---

### Story 13.6: Configure Lifecycle Rules for Cost Optimization
**As a** platform administrator
**I want** lifecycle rules that optimize storage costs
**So that** infrequently accessed content moves to cheaper storage

**Tasks:**
1. Create `lifecycle.json` configuration file
2. Apply lifecycle policy to bucket
3. Verify rules are active

**Acceptance Criteria:**
- [ ] `lifecycle.json` created with cost optimization rules
- [ ] Lifecycle policy applied to bucket
- [ ] Objects transition to NEARLINE after 30 days
- [ ] Old versions deleted after 5 newer versions exist

**Configuration File (`lifecycle.json`):**
```json
{
  "rule": [
    {
      "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" },
      "condition": { "age": 30 }
    },
    {
      "action": { "type": "Delete" },
      "condition": { "numNewerVersions": 5 }
    }
  ]
}
```

**Commands:**
```bash
gcloud storage buckets update gs://sda-assets-prod --lifecycle-file=lifecycle.json
```

**Notes:**
- NEARLINE is cheaper for infrequently accessed data
- Keeping 5 versions balances recovery needs with storage costs
- Adjust based on actual usage patterns

---

## Phase 4: Initial Data Migration

### Story 13.7: Establish Folder Structure Convention
**As a** developer working with resort assets
**I want** a consistent folder structure in the bucket
**So that** assets are organized and easy to find

**Target Structure:**
```
resorts/{country}/{state}/{slug}/
  assets.json           # Manifest of all resort assets
  images/               # Resort photos
  trailmaps/            # Trail map images/PDFs
  logos/                # Resort logos
  docs/                 # Documents (guides, policies)
  data/                 # Data files (JSON, CSV)
  originals/            # Original high-res source files
```

**Examples:**
- `resorts/us/colorado/vail/images/hero.jpg`
- `resorts/us/utah/park-city/trailmaps/2024-map.pdf`
- `resorts/ca/british-columbia/whistler/logos/logo-primary.svg`

**Acceptance Criteria:**
- [ ] Folder structure documented in project
- [ ] Convention understood by team
- [ ] Sample folder structure created for test resort

**Notes:**
- "Folders" in GCS are virtual (just prefixes)
- Maintain consistency across all resorts
- `originals/` is for source files that may need reprocessing

---

### Story 13.8: Migrate Local Assets to Bucket
**As a** platform administrator
**I want** to migrate existing local resort assets to the bucket
**So that** assets are served from cloud storage

**Tasks:**
1. Organize local `resorts/` directory to match target structure
2. Run rsync to upload all files
3. Verify files uploaded correctly

**Acceptance Criteria:**
- [ ] All local assets uploaded to bucket
- [ ] File structure matches convention
- [ ] No upload errors
- [ ] Sample file accessible via public URL

**Commands:**
```bash
# Sync local to bucket (PowerShell/Windows)
gsutil -m rsync -r ".\resorts" "gs://sda-assets-prod/resorts"

# Verify upload
gsutil ls -r gs://sda-assets-prod/resorts/**
```

**Notes:**
- `-m` flag enables parallel uploads
- `-r` flag enables recursive sync
- Initial upload may take significant time depending on data size

---

### Story 13.9: Set Cache-Control Headers
**As a** website visitor
**I want** assets to be cached appropriately
**So that** pages load quickly on repeat visits

**Tasks:**
1. Set long-lived cache for immutable binary assets (images, PDFs)
2. Set short-lived cache for JSON manifests/data files
3. Verify headers in HTTP response

**Acceptance Criteria:**
- [ ] Images, trail maps, logos have 1-year cache with immutable
- [ ] JSON files have 5-minute cache for fast updates
- [ ] Cache-Control headers verified via curl

**Commands:**
```bash
# Long cache for static binaries (immutable)
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  "gs://sda-assets-prod/resorts/**/images/**" \
  "gs://sda-assets-prod/resorts/**/trailmaps/**" \
  "gs://sda-assets-prod/resorts/**/logos/**"

# Short cache for JSON (5 minutes)
gsutil -m setmeta -h "Cache-Control:public, max-age=300" \
  "gs://sda-assets-prod/resorts/**/assets.json" \
  "gs://sda-assets-prod/resorts/**/data/*.json"
```

**Verification:**
```bash
curl -I "https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/assets.json"
```

---

### Story 13.10: Verify Public URL Access
**As a** developer
**I want** to verify that public URLs work correctly
**So that** I can confidently use them in the website

**Tasks:**
1. Test public URL for sample asset
2. Verify no authentication required
3. Check response headers (CORS, Cache-Control, Content-Type)

**Acceptance Criteria:**
- [ ] Public URL returns 200 OK
- [ ] No authentication errors
- [ ] CORS headers present
- [ ] Cache-Control headers correct
- [ ] Content-Type matches file type

**Public URL Format:**
```
https://storage.googleapis.com/sda-assets-prod/resorts/{country}/{state}/{slug}/...
```

**Example URLs:**
- `https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/assets.json`
- `https://storage.googleapis.com/sda-assets-prod/resorts/us/alaska/eaglecrest/images/hero.jpg`

**Verification Commands:**
```bash
# Test JSON manifest
curl -I "https://storage.googleapis.com/sda-assets-prod/resorts/us/alaska/eaglecrest/assets.json"

# Test image file
curl -I "https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/images/hero.jpg"
```

---

## Phase 5: Migration Tooling (Future)

### Story 13.11: Design Migration CLI Tool
**As a** content administrator
**I want** a CLI tool for uploading and managing resort assets
**So that** I can easily add/update assets with proper processing

**Tool Capabilities (Design):**
- Accept source images and generate variants (600/1200/1600px, AVIF/WebP/JPEG)
- Upload with correct `contentType` and `cacheControl`
- Generate/update per-resort `assets.json` manifest
- Support batch operations for multiple resorts

**Tech Stack:**
- Node.js CLI (TypeScript)
- `@google-cloud/storage` for GCS operations
- `sharp` for image processing
- `mime` for content type detection
- `commander` for CLI interface

**Configuration:**
```
ASSETS_BUCKET=sda-assets-prod
```

**Authentication:**
- Local: Application Default Credentials
- CI: Service account via Workload Identity Federation or key

**Acceptance Criteria:**
- [ ] CLI design documented
- [ ] Package dependencies identified
- [ ] Commands and options specified
- [ ] Ready for implementation (separate epic)

**Note:** Full implementation is a separate epic. This story captures the design.

---

### Story 13.12: Document Website Asset Integration
**As a** frontend developer
**I want** documentation on using GCS assets in the website
**So that** I can properly reference images and data

**Documentation Topics:**
1. Public URL pattern for different asset types
2. How to construct asset URLs from resort data
3. Fallback handling for missing assets
4. Image optimization (responsive images, format selection)
5. Caching considerations for client-side code

**Example Component Usage:**
```tsx
// Construct asset URL from resort data
const getAssetUrl = (country: string, state: string, slug: string, path: string) =>
  `https://storage.googleapis.com/sda-assets-prod/resorts/${country}/${state}/${slug}/${path}`;

// Usage
const heroImage = getAssetUrl('us', 'colorado', 'vail', 'images/hero.jpg');
```

**Acceptance Criteria:**
- [ ] Asset URL patterns documented
- [ ] Helper function examples provided
- [ ] Error handling patterns documented
- [ ] Integration with existing image components documented

---

## Verification Checklist

### Infrastructure Verification
- [ ] Project set and `storage.googleapis.com` API enabled
- [ ] Bucket created: `gs://sda-assets-prod` (US, uniform access, versioning)
- [ ] Public read granted to `allUsers`
- [ ] Service account `assets-admin` created with `roles/storage.objectAdmin`
- [ ] CORS policy applied
- [ ] Lifecycle rules applied

### Migration Verification
- [ ] Folder structure follows convention
- [ ] Initial migration completed (rsync)
- [ ] Cache-Control headers set appropriately
- [ ] Public URLs smoke-tested and working

---

## Security Considerations

1. **Public Bucket**: Everything in `sda-assets-prod` is publicly accessible. Never store:
   - User data
   - Credentials or API keys
   - Internal documents
   - Anything sensitive

2. **Service Account**:
   - Use least privilege (only bucket-level admin, not project-level)
   - Prefer Workload Identity Federation over key files
   - Rotate keys periodically if using key files
   - Never commit keys to source control

3. **Future Considerations**:
   - Add Cloud CDN for better caching and custom domain
   - Consider signed URLs for premium content
   - Implement Cloud Armor for DDoS protection if needed

---

## Summary

| Story | Title | Priority | Effort |
|-------|-------|----------|--------|
| 13.1 | Authenticate and Configure GCloud CLI | High | Small |
| 13.2 | Create Production Storage Bucket | High | Small |
| 13.3 | Configure Public Read Access | High | Small |
| 13.4 | Create Admin Service Account | High | Small |
| 13.5 | Configure CORS for Browser Access | High | Small |
| 13.6 | Configure Lifecycle Rules | Medium | Small |
| 13.7 | Establish Folder Structure Convention | High | Small |
| 13.8 | Migrate Local Assets to Bucket | High | Medium |
| 13.9 | Set Cache-Control Headers | Medium | Small |
| 13.10 | Verify Public URL Access | High | Small |
| 13.11 | Design Migration CLI Tool | Low | Medium |
| 13.12 | Document Website Asset Integration | Medium | Small |

**Total Stories:** 12
**Overall Effort:** Medium (mostly configuration, one design story)
