# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) documenting significant architectural decisions for the Ski Resort Directory project.

## What is an ADR?

An Architecture Decision Record captures a single architectural decision along with its context and consequences. ADRs are immutable once accepted - if a decision changes, create a new ADR that supersedes the old one.

## When to Write an ADR

Create an ADR when:

- Choosing between multiple valid technical approaches
- Making decisions that affect multiple parts of the system
- Selecting frameworks, libraries, or tools
- Defining patterns that should be followed consistently
- Making breaking changes to existing architecture

## Naming Convention

```
NNNN-short-title.md
```

- `NNNN`: Sequential 4-digit number (0001, 0002, etc.)
- `short-title`: Lowercase, hyphen-separated description

Examples:
- `0001-adopt-adrs.md`
- `0002-use-supabase-for-database.md`
- `0003-leaflet-for-interactive-maps.md`

## Status Values

| Status | Description |
|--------|-------------|
| **Proposed** | Under discussion, not yet approved |
| **Accepted** | Approved and in effect |
| **Deprecated** | No longer applies to new work |
| **Superseded** | Replaced by another ADR (link to replacement) |

## Creating a New ADR

1. Copy `0000-adr-template.md` to a new file with the next sequential number
2. Fill in all sections with relevant details
3. Submit as part of a PR for team review
4. Once merged, update status to "Accepted"

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0000](0000-adr-template.md) | ADR Template | Template | - |
| [0001](0001-adopt-adrs.md) | Adopt Architecture Decision Records | Accepted | 2025-12-03 |
