# GCP Implementation: Resort Blob Storage and CDN

This document defines how we store and serve all resort-related blobs (images, PDFs, JSON, GPX, etc.) on Google Cloud Platform, fronted by a CDN, and how the app consumes them.

## Overview
- **Storage**: Google Cloud Storage (GCS) buckets (dev/prod) with uniform access and versioning.
- **CDN**: Cloud CDN in front of a backend bucket, exposed via HTTPS LB and `cdn.ski-directory.com`.
- **Layout**: One directory per resort with flexible subfolders for any file types.
- **Discovery**: A per-resort `assets.json` manifest indexes images and arbitrary files.
- **App**: Library fetches the manifest; UI falls back to in-code `images[]` then `heroImage` during migration.

## Buckets and Domains
- **Buckets**
  - `sda-assets-dev` (dev) and `sda-assets-prod` (prod)
  - Location: `US` multi‑region
  - Uniform bucket-level access: ON
  - Object versioning: ON
- **Domain**
  - `cdn.ski-directory.com` fronts `sda-assets-prod` via Cloud CDN + HTTPS load balancer.
  - Dev can use the raw storage URL or a separate dev CDN (optional).

## Object Layout
Base path for a resort:
```
resorts/{country}/{state}/{slug}/
  assets.json                  # Manifest (images + generic files)
  images/                      # Transcoded variants
  trailmaps/                   # PDFs/JPGs
  logos/                       # Brand marks
  docs/                        # Unstructured docs (PDF, TXT)
  data/                        # Structured JSON (snow-report.json, events.json)
  originals/                   # Optional source uploads (can be private)
```

### Naming (images)
- Variants per image: widths 600, 1200, 1600 (optionally 2048 for large hero)
- Formats: AVIF, WebP, JPEG fallback
- Quality defaults: AVIF q≈45, WebP q≈80, JPEG q≈82
- Example names: `images/card-overview@600w.webp`, `images/hero-main@1600w.avif`

## Manifest (assets.json)
The manifest indexes image variants and arbitrary files. The app resolves `url` relative to `baseUrl`.

```json
{
  "version": 1,
  "resortId": "resort:eaglecrest",
  "slug": "eaglecrest",
  "updatedAt": "2025-11-28T07:46:00Z",
  "baseUrl": "https://cdn.ski-directory.com/resorts/us/alaska/eaglecrest",
  "images": [
    { "url": "images/card@600w.webp", "alt": "Eaglecrest overview", "priority": 1, "isCardImage": true, "isHeroImage": false, "width": 600, "height": 400, "format": "webp" },
    { "url": "images/hero@1600w.avif", "alt": "Eaglecrest hero", "priority": 2, "isCardImage": false, "isHeroImage": true, "width": 1600, "height": 900, "format": "avif" }
  ],
  "files": [
    { "url": "trailmaps/2025.jpg", "type": "image/jpeg", "label": "Trail Map 2025", "category": "trailmap", "year": 2025 },
    { "url": "docs/history.pdf", "type": "application/pdf", "label": "History", "category": "document" },
    { "url": "data/snow-report.json", "type": "application/json", "label": "Snow Report", "category": "data" }
  ]
}
```

Notes:
- Compatible with the existing `ResortImage` shape (`url`, `alt`, `priority`, `isCardImage`, `isHeroImage`). Extra fields are additive.
- Keep `assets.json` relatively small; large galleries can list only preferred variants.

## Caching and CORS
- **Cache-Control**
  - Images/logos/trailmaps: `public, max-age=31536000, immutable`
  - `assets.json` and JSON under `data/`: `public, max-age=300`
- **CORS** (public assets)
  - Methods: `GET, HEAD, OPTIONS`
  - Origins: `*` (or restrict to site origins if desired)

Example `cors.json`:
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

## IAM and Security
- **Service accounts**
  - `assets-uploader@<project>.iam.gserviceaccount.com`: Storage Object Admin on buckets (or Writer with narrowly scoped conditions). Used by CI and trusted local ops.
  - Public read: grant `roles/storage.objectViewer` to `allUsers` at bucket level (if fully public assets).
- **Principles**
  - Principle of least privilege. Keep uploader keys only in CI secrets and developer machines as needed.
  - Consider separate dev/prod SAs or per‑environment roles.

## Provisioning (gcloud)
Replace placeholders: `<project>`, `<region>`, `<domain>`.

- Create bucket (prod):
```bash
# Bucket
gcloud storage buckets create gs://sda-assets-prod \
  --project=<project> \
  --location=US \
  --uniform-bucket-level-access

# Versioning
gcloud storage buckets update gs://sda-assets-prod --versioning

# Public read (optional)
gcloud storage buckets add-iam-policy-binding gs://sda-assets-prod \
  --member=allUsers \
  --role=roles/storage.objectViewer

# CORS
gcloud storage buckets update gs://sda-assets-prod --cors-file=cors.json
```

- Cloud CDN + HTTPS LB for `cdn.ski-directory.com`:
```bash
# Reserve a global IP
gcloud compute addresses create assets-cdn-ip --global --project=<project>

# Backend bucket with CDN
gcloud compute backend-buckets create assets-backend \
  --gcs-bucket-name=sda-assets-prod \
  --enable-cdn \
  --project=<project>

# URL map
gcloud compute url-maps create assets-url-map \
  --default-backend-bucket=assets-backend \
  --project=<project>

# Managed certificate
gcloud compute ssl-certificates create cdn-ski-dir-cert \
  --domains=cdn.ski-directory.com \
  --project=<project> --global

# HTTPS proxy
gcloud compute target-https-proxies create assets-https-proxy \
  --url-map=assets-url-map \
  --ssl-certificates=cdn-ski-dir-cert \
  --project=<project>

# Forwarding rule (443)
gcloud compute forwarding-rules create assets-https-fr \
  --address=assets-cdn-ip \
  --global \
  --target-https-proxy=assets-https-proxy \
  --ports=443 \
  --project=<project>

# DNS: point cdn.ski-directory.com to the created global IP
```

## Lifecycle and Cost Controls
- Consider Autoclass or lifecycle rules:
```json
{
  "rule": [
    { "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" }, "condition": { "age": 30 } },
    { "action": { "type": "Delete" }, "condition": { "numNewerVersions": 5 } }
  ]
}
```
Apply with: `gcloud storage buckets update gs://sda-assets-prod --lifecycle-file=lifecycle.json`

## App Integration
- **Config**
  - Env: `ASSETS_BASE=https://cdn.ski-directory.com`
  - Keep region data fallbacks: `resort.images` → `resort.heroImage`
- **Library (`lib/assets.ts`) – responsibilities**
  - Compute path: `resorts/{country}/{state}/{slug}/assets.json`
  - Fetch and parse manifest; prepend `baseUrl` to relative `url`s
  - Return `{ images: ResortImage[]; files: AssetFile[] }`
  - Fallbacks: if manifest missing, return `resort.images` or synthesize from `heroImage`
- **UI**
  - `getCardImage` / `getHeroImage` prefer manifest-provided `images` when present.
  - Current components use `<img>`; if migrating to `next/image`, add `cdn.ski-directory.com` to `images.remotePatterns`.

Example Next config addition (when switching to `next/image` sources):
```js
// apps/v1/next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.ski-directory.com' },
      // existing patterns...
    ],
  },
};
```

## Uploader CLI (Node) – Design
- **Purpose**: Download originals (or accept local files), transcode variants (AVIF/WebP/JPEG), upload to GCS with headers/metadata, and write/merge `assets.json`.
- **Tech**: `@google-cloud/storage`, `sharp`, `mime`, `commander`.
- **Inputs**
  - Resort identity: `{country,state,slug}` (or infer from `resort.id`)
  - Files/URLs, `alt` text, `priority`, `isCardImage`, `isHeroImage`
  - File category for non-images: `trailmap`, `document`, `data`, etc.
- **Outputs**
  - Uploaded variants under the resort path with correct `Content-Type` and `Cache-Control`
  - Updated `assets.json` with image variants and files
- **Notes**
  - Optionally keep `originals/` for future reprocessing (can be private)
  - Consider content-hashed filenames for immutable cache busting; otherwise rely on versioning + manifest updates

## Migration Plan
- **Phase 1**: Provision GCS, set up CDN, seed 5–10 resorts with manifests and assets.
- **Phase 2**: Implement `lib/assets.ts`, update helpers to prefer manifest; keep fallbacks.
- **Phase 3**: Roll out per-region manifests; add placeholders where needed.
- **Phase 4**: After full coverage, remove `heroImage` from region files (post‑deprecation).

## Monitoring and Observability
- Enable Cloud CDN logs and export to BigQuery for 404s / cache metrics.
- Cloud Monitoring dashboard: request volume, hit ratio, 4xx/5xx, latency.
- Optional uptime check on `cdn.ski-directory.com`.

## Security Considerations
- Public read is acceptable for public content; restrict sensitive blobs or move to private buckets with signed URLs if needed.
- Store uploader SA key only in CI secrets; use ADC locally.
- Consider organization policies to restrict bucket IAM drift.

## Runbooks
- **New resort**
  - Create folder `resorts/{country}/{state}/{slug}/`
  - Upload images/docs/data via uploader
  - Generate/update `assets.json`
  - Verify URLs via `cdn.ski-directory.com`
- **Update asset**
  - Upload new variant(s) with new filename (or rely on versioning)
  - Update `assets.json` `updatedAt` and entries
  - Verify cache invalidation (new filename avoids stale cache)
- **Remove/replace**
  - Remove from manifest; optionally delete old objects or keep via versioning

## Appendix
- **CORS**: see `cors.json` example above
- **Lifecycle**: sample rule above
- **gcloud CDN**: commands above
- **Sample asset URLs**
  - `https://cdn.ski-directory.com/resorts/us/alaska/eaglecrest/images/hero@1600w.avif`
  - `https://cdn.ski-directory.com/resorts/us/alaska/eaglecrest/trailmaps/2025.jpg`
