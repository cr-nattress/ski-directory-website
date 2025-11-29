# GCP Setup: Single-Prod Cloud Storage for Ski Directory

This guide sets up a single production Google Cloud Storage (GCS) bucket with:
- Public read (anonymous) for website asset delivery
- One admin service account with read/write/manage for internal tools
- A consistent folder structure and a simple migration path from local files

Notes:
- Bucket names are globally unique. If `sda-assets-prod` is taken, choose another name.
- Some organizations enforce Public Access Prevention; you may need to inherit/relax it at the bucket level as shown below.

---

## 0) Prerequisites
- Google Cloud project with billing enabled: `<project-id>`
- Local: Google Cloud SDK installed (includes `gcloud`, `gsutil`)
- IAM permission to create buckets, IAM bindings, and service accounts

## 1) Authenticate and set project
```bash
gcloud auth login
gcloud config set project <project-id>
gcloud auth application-default login

# APIs
gcloud services enable storage.googleapis.com
```

## 2) Create the prod bucket
- US multi-region
- Uniform bucket-level access
- Object versioning
```bash
gcloud storage buckets create gs://sda-assets-prod \
  --project=<project-id> \
  --location=US \
  --uniform-bucket-level-access

gcloud storage buckets update gs://sda-assets-prod --versioning
```

## 3) Public read for website
If your org uses Public Access Prevention, relax it on this bucket:
```bash
gcloud storage buckets update gs://sda-assets-prod --public-access-prevention=inherited
```
Grant anonymous read at bucket level:
```bash
gcloud storage buckets add-iam-policy-binding gs://sda-assets-prod \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

## 4) Admin identity for internal apps
Create a service account and grant admin on the bucket:
```bash
gcloud iam service-accounts create assets-admin --display-name="Assets Admin"

gcloud storage buckets add-iam-policy-binding gs://sda-assets-prod \
  --member=serviceAccount:assets-admin@<project-id>.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin
```
Keys (only if needed; prefer Workload Identity Federation for CI):
```bash
gcloud iam service-accounts keys create assets-admin-key.json \
  --iam-account=assets-admin@<project-id>.iam.gserviceaccount.com
```
Store the key securely (CI secret manager, not in the repo). For local dev, prefer Application Default Credentials (ADC) without a key.

## 5) CORS (for browser access)
Create `cors.json` (copy locally):
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
Apply it:
```bash
gcloud storage buckets update gs://sda-assets-prod --cors-file=cors.json
```

## 6) Lifecycle (optional, cost control)
Create `lifecycle.json`:
```json
{
  "rule": [
    { "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" }, "condition": { "age": 30 } },
    { "action": { "type": "Delete" }, "condition": { "numNewerVersions": 5 } }
  ]
}
```
Apply it:
```bash
gcloud storage buckets update gs://sda-assets-prod --lifecycle-file=lifecycle.json
```

## 7) Folder structure convention
Objects use virtual folders via prefixes:
```
resorts/{country}/{state}/{slug}/
  assets.json
  images/
  trailmaps/
  logos/
  docs/
  data/
  originals/   # If you later need private originals, use a separate private bucket
```

## 8) Quick migration (local → bucket)
Mirror local directories into the bucket (PowerShell on Windows shown):
```bash
gsutil -m rsync -r ".\resorts" "gs://sda-assets-prod/resorts"
```
Set recommended Cache-Control:
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
Verify:
```bash
gsutil ls -r gs://sda-assets-prod/resorts/**
curl -I "https://storage.googleapis.com/sda-assets-prod/resorts/us/alaska/eaglecrest/assets.json"
```

## 9) Migration app (recommended for ongoing updates)
A small Node CLI can standardize uploads and manifests.
- Tech: `@google-cloud/storage`, `sharp`, `mime`, `commander`
- Responsibilities:
  - Generate image variants (e.g., 600/1200/1600, AVIF/WebP/JPEG)
  - Upload with correct `contentType` and `cacheControl`
  - Write/merge per-resort `assets.json`
- Config:
  - `ASSETS_BUCKET=sda-assets-prod`
  - Auth: ADC locally; CI uses `assets-admin` (WIF or key)

## 10) Website usage
- Public URLs (no credentials):
  - `https://storage.googleapis.com/sda-assets-prod/resorts/{country}/{state}/{slug}/...`
- Example manifest path:
  - `https://storage.googleapis.com/sda-assets-prod/resorts/us/alaska/eaglecrest/assets.json`
- Optional later: front with Cloud CDN and a custom domain (see GCP-IMPLEMENTATION.md).

## 11) Security considerations
- With public reader at bucket level, everything in this bucket is public. Use a separate private bucket for any sensitive content.
- Follow principle of least privilege for `assets-admin`. Narrow scope or add conditions as needs evolve.

---

## Checklist
- [ ] Project set and `storage.googleapis.com` API enabled
- [ ] Bucket created: `gs://sda-assets-prod` (US, uniform access, versioning)
- [ ] Public read granted to `allUsers`
- [ ] Service account `assets-admin` created and granted bucket `roles/storage.objectAdmin`
- [ ] CORS applied
- [ ] Lifecycle rules applied (optional)
- [ ] Initial migration done (rsync + metadata)
- [ ] Public URL smoke-tested
