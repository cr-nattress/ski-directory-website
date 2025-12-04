---
title: "Documentation Index"
description: "Central documentation hub for the Ski Resort Directory project"
tags:
  - documentation
  - index
  - navigation
---

# Documentation Index

Central hub for all Ski Resort Directory documentation.

## Quick Links

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System design, data flow, tech stack |
| [Development Guide](./development.md) | Setup, commands, common patterns |
| [API Reference](./api-reference.md) | Supabase services, hooks, endpoints |
| [Data Model](./data-model.md) | Resort schema, types, database structure |
| [Updaters](./updaters.md) | Wikipedia, Liftie, and data sync tools |

## Project Overview

The Ski Resort Directory is a comprehensive guide to 100+ ski resorts across North America, featuring:

- Interactive Leaflet map with color-coded pass markers
- A-Z sortable/filterable directory
- Detailed resort pages with terrain stats, conditions, and trail maps
- Multi-pass support (Epic, Ikon, Indy, Mountain Collective, etc.)
- Real-time conditions from Liftie.info integration

## Repository Structure

```
state-ski-resort-directory/
├── apps/
│   ├── v1/                     # Main Next.js application
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   └── lib/                # Services, hooks, utilities
│   └── updaters/               # Data sync tools
│       ├── liftie-sync/        # Real-time conditions
│       ├── wikipedia-updater/  # Resort content
│       └── wikidata-enricher/  # Metadata enrichment
├── backlog/                    # Epic/story planning
├── docs/                       # 📍 You are here
├── gcp/                        # Google Cloud configuration
├── research/                   # Design specs and references
└── schemas/                    # Data schemas
```

## Key Documentation Files

### Root Level

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick start, features |
| `CLAUDE.md` | AI coding assistant instructions |
| `GCP-SETUP.md` | Google Cloud Storage configuration |
| `GRAFANA-IMPLEMENTATION.md` | Observability setup guide |

### Application (`apps/v1/`)

| File | Purpose |
|------|---------|
| `README.md` | Landing page component overview |
| `SEO-RECOMMENDATIONS.md` | SEO audit and improvements |
| `grafana/README.md` | Dashboard configuration |

### Backlog (`backlog/`)

| File | Purpose |
|------|---------|
| `README.md` | Epic overview and implementation order |
| `epic-{N}-*/README.md` | Individual epic details |

## Related

- [Main README](../README.md) - Project introduction
- [CLAUDE.md](../CLAUDE.md) - AI assistant context
- [Backlog](../backlog/README.md) - Development roadmap
