---
title: "Development Guide"
description: "Setup instructions, commands, and development patterns for the Ski Resort Directory"
tags:
  - development
  - setup
  - commands
  - nextjs
  - typescript
---

# Development Guide

Setup, commands, and development patterns for the Ski Resort Directory.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Commands](#available-commands)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Git Workflow](#git-workflow)

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud account (for GCS assets)

## Quick Start

```bash
# Clone repository
git clone https://github.com/your-username/state-ski-resort-directory.git
cd state-ski-resort-directory

# Navigate to main app
cd apps/v1

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Create `apps/v1/.env.local` with:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Feature flags
NEXT_PUBLIC_USE_SUPABASE=true

# Pagination
NEXT_PUBLIC_INITIAL_PAGE_SIZE=12

# Observability (optional)
NEXT_PUBLIC_GRAFANA_LOKI_URL=https://logs-prod.grafana.net
NEXT_PUBLIC_GRAFANA_LOKI_USERNAME=your-user-id
NEXT_PUBLIC_GRAFANA_LOKI_TOKEN=your-api-token
```

## Available Commands

All commands run from `apps/v1/`:

### Development

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
```

### Testing

```bash
npm test          # Run Vitest in watch mode
npm run test:run  # Run tests once
npm run test:coverage  # Run with coverage report
```

### Database

```bash
npm run db:migrate           # Run migration script
npm run db:migrate:dry-run   # Preview migration
npm run db:migrate:colorado  # Migrate Colorado only
```

### Cache Management

```bash
# Clear Next.js cache (useful for hydration issues)
rm -rf .next && npm run dev
```

## Common Patterns

### Adding a New Resort Field

1. Add column to Supabase `resorts` table
2. Update `resorts_full` view if needed
3. Add to `ResortFull` type in `types/supabase.ts`
4. Update `adaptResortFromSupabase()` in `lib/api/supabase-resort-adapter.ts`
5. Add to frontend `Resort` type in `lib/types/resort.ts`
6. Use in components

### Creating a New Component

```tsx
// components/MyComponent.tsx
'use client';

import { useState } from 'react';

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}
```

### Adding a New API Route

```tsx
// app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, RATE_LIMITS } from '@/lib/middleware/rate-limit';

const requestSchema = z.object({
  // Define schema
});

export async function POST(request: Request) {
  // Rate limit check
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.default);
  if (rateLimitResponse) return rateLimitResponse;

  // Validate request
  const body = await request.json();
  const parseResult = requestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  // Process request
  return NextResponse.json({ success: true });
}
```

### Using Feature Flags

```tsx
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';

function MyComponent() {
  const showWeather = useFeatureFlag('weatherForecastCard');

  if (!showWeather) return null;

  return <WeatherCard />;
}
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Leaflet "window is not defined" | Use dynamic import with `ssr: false` |
| Resort not showing on map | Check `location` in Supabase (needs lat/lng) |
| Wrong state in URL | Route validates state matches DB; mismatches return 404 |
| Supabase types out of sync | Run `npx supabase gen types typescript` |
| GCS images 404 | Check `asset_path` in Supabase and GCS bucket |
| Hydration mismatch | Check `isHydrated` flag in hooks using localStorage |

### Clearing Cache

```bash
# Next.js build cache
rm -rf .next

# npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules && npm install
```

## Git Workflow

### Branch Strategy

- Main branch: `master`
- Epic branches: `epic-{number}-{short-description}`

### Creating a New Epic Branch

```bash
# Start from master
git checkout master
git pull

# Create epic branch
git checkout -b epic-30-my-new-feature
```

### Commit Message Format

```
Brief description of change

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Pull Request Process

1. Push epic branch to remote
2. Create PR against `master`
3. Wait for review and approval
4. Merge via GitHub (no force push)

## Related

- [Architecture](./architecture.md) - System design
- [API Reference](./api-reference.md) - Service methods
- [Data Model](./data-model.md) - Schema details
