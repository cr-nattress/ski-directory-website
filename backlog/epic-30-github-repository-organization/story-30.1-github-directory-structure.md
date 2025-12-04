# Story 30.1: Create `.github/` Directory Structure

## Description

Create the `.github/` directory with required subdirectories as GitHub's configuration hub. This is the foundation for all GitHub-specific configurations including workflows, templates, and automation.

## Acceptance Criteria

- [ ] `.github/` directory exists at repository root
- [ ] `.github/ISSUE_TEMPLATE/` subdirectory created
- [ ] `.github/workflows/` subdirectory created
- [ ] Directory structure matches GitHub conventions

## Technical Details

### Directory Structure

```
.github/
├── ISSUE_TEMPLATE/       # Issue templates and forms
├── workflows/            # GitHub Actions workflows
└── (files added in subsequent stories)
```

### Implementation Notes

- Workflows must reside in `.github/workflows/` (flat structure, no subdirectories)
- Issue templates go in `.github/ISSUE_TEMPLATE/`
- GitHub searches for templates in this directory automatically

## Tasks

- [ ] Create `.github/` directory
- [ ] Create `.github/ISSUE_TEMPLATE/` subdirectory
- [ ] Create `.github/workflows/` subdirectory
- [ ] Add `.gitkeep` files if needed to preserve empty directories

## Effort

**Size:** S (Small - < 1 hour)

## References

- [GITHUB.md - Repository Structure](../../GITHUB.md#standard-directory-structure)
