---
title: "Main Application (v1)"
description: "Next.js 14 application for the Ski Resort Directory"
parent: "ski-resort-directory"
tags:
  - nextjs
  - application
  - frontend
---

# Ski Resort Directory - Main Application

The primary Next.js 14 application powering the Ski Resort Directory.

## Quick Start

```bash
cd apps/v1
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation

For comprehensive documentation, see:

| Document | Description |
|----------|-------------|
| [Root README](../../README.md) | Project overview and features |
| [Development Guide](../../docs/development.md) | Setup, commands, patterns |
| [Architecture](../../docs/architecture.md) | System design and data flow |
| [API Reference](../../docs/api-reference.md) | Services, hooks, endpoints |
| [Data Model](../../docs/data-model.md) | Types and database schema |
| [CLAUDE.md](../../CLAUDE.md) | AI coding assistant context |

## Directory Structure

```
apps/v1/
├── app/                # Next.js App Router pages
├── components/         # React components
├── lib/                # Services, hooks, utilities
├── grafana/            # Observability dashboards
└── public/             # Static assets
```

## Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npm test         # Vitest tests
```

## Related

- [Grafana Dashboards](./grafana/README.md)
- [Updaters](../updaters/) - Data sync tools
