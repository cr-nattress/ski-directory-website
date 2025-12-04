# Story 30.18: Add Architecture Decision Records Structure

## Description

Create the Architecture Decision Records (ADR) directory structure and provide a template for documenting significant architectural decisions with context, consequences, and rationale.

## Acceptance Criteria

- [ ] `docs/decisions/` directory exists
- [ ] ADR template file created
- [ ] First ADR documenting ADR adoption
- [ ] Naming convention documented
- [ ] README in decisions folder explains usage

## Technical Details

### Directory Structure

```
docs/
└── decisions/
    ├── README.md
    ├── 0000-adr-template.md
    └── 0001-adopt-adrs.md
```

### ADR Template (0000-adr-template.md)

```markdown
# ADR-XXXX: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## Date

YYYY-MM-DD

## Context

[Describe the issue that is motivating this decision. What is the problem we're trying to solve? What constraints exist?]

## Decision

[Describe the decision that was made. Use active voice: "We will..."]

## Consequences

### Positive

- [Benefit 1]
- [Benefit 2]

### Negative

- [Drawback 1]
- [Drawback 2]

### Neutral

- [Side effect that is neither positive nor negative]

## Alternatives Considered

### Alternative 1: [Name]

[Description and why it was not chosen]

### Alternative 2: [Name]

[Description and why it was not chosen]

## References

- [Link to relevant documentation]
- [Link to related ADRs]
```

### First ADR (0001-adopt-adrs.md)

```markdown
# ADR-0001: Adopt Architecture Decision Records

## Status

Accepted

## Date

2025-12-03

## Context

As the Ski Resort Directory project grows, architectural decisions are made informally and context is lost over time. New contributors don't understand why certain choices were made, leading to:

- Repeated discussions about settled decisions
- Accidental reversal of intentional design choices
- Difficulty onboarding new team members
- Lost institutional knowledge

## Decision

We will use Architecture Decision Records (ADRs) to document significant architectural decisions. ADRs will:

1. Be stored in `docs/decisions/`
2. Follow a sequential numbering scheme (0001, 0002, etc.)
3. Use the template in `0000-adr-template.md`
4. Be immutable once accepted (supersede rather than modify)
5. Be written in Markdown for version control

## Consequences

### Positive

- Decisions are documented with context and rationale
- New team members can understand why decisions were made
- Prevents rehashing settled discussions
- Creates searchable history of architectural evolution

### Negative

- Additional overhead to write ADRs
- Requires discipline to maintain

### Neutral

- ADRs become part of the codebase and PR process

## Alternatives Considered

### Alternative 1: Wiki-based documentation

Not chosen because wikis lack version control integration and are often disconnected from code changes.

### Alternative 2: No formal documentation

Not chosen because this leads to lost context and repeated discussions.

## References

- [GITHUB.md - Architecture Decision Records](../../GITHUB.md)
- [Michael Nygard's original ADR article](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
```

### decisions/README.md

```markdown
# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) documenting significant architectural decisions for the Ski Resort Directory project.

## What is an ADR?

An ADR captures a single decision with its context and consequences. ADRs are immutable once accepted - if a decision changes, create a new ADR that supersedes the old one.

## When to Write an ADR

Create an ADR when:
- Choosing between multiple valid technical approaches
- Making decisions that affect multiple parts of the system
- Selecting frameworks, libraries, or tools
- Defining patterns that should be followed consistently
- Making breaking changes to existing architecture

## Naming Convention

`NNNN-short-title.md`

- NNNN: Sequential 4-digit number
- short-title: Lowercase, hyphen-separated description

Examples:
- `0001-adopt-adrs.md`
- `0002-use-supabase-for-database.md`
- `0003-leaflet-for-maps.md`

## Status Values

- **Proposed**: Under discussion
- **Accepted**: Approved and in effect
- **Deprecated**: No longer applies
- **Superseded**: Replaced by another ADR (link to replacement)

## Creating a New ADR

1. Copy `0000-adr-template.md`
2. Rename with next sequential number
3. Fill in all sections
4. Submit as part of a PR for review
5. Once merged, status becomes "Accepted"
```

## Tasks

- [ ] Create `docs/decisions/` directory
- [ ] Create `docs/decisions/README.md`
- [ ] Create `docs/decisions/0000-adr-template.md`
- [ ] Create `docs/decisions/0001-adopt-adrs.md`
- [ ] Update main docs/README.md to link to decisions

## Effort

**Size:** S (Small - < 1 hour)

## References

- [GITHUB.md - Architecture Decision Records](../../GITHUB.md#architecture-decision-records-adrs)
- [ADR GitHub Organization](https://adr.github.io/)
