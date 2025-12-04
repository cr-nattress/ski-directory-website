# Story 30.15: Add CODEOWNERS File

## Description

Create a CODEOWNERS file to automatically request reviews from the appropriate people or teams when pull requests modify certain files or directories.

## Acceptance Criteria

- [ ] `.github/CODEOWNERS` file exists
- [ ] Default owner(s) specified
- [ ] Directory-specific ownership defined
- [ ] Critical files protected (CODEOWNERS itself, workflows)
- [ ] Pattern syntax is correct and tested

## Technical Details

### CODEOWNERS File

```
# CODEOWNERS - Automatic review assignment
# See: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# =============================================================================
# DEFAULT OWNER
# These owners will be requested for review on all PRs unless a more specific
# rule below matches.
# =============================================================================

* @YOUR_USERNAME

# =============================================================================
# APPLICATION CODE
# =============================================================================

# Main Next.js application
/apps/v1/ @YOUR_USERNAME

# Components
/apps/v1/components/ @YOUR_USERNAME

# API and data layer
/apps/v1/lib/api/ @YOUR_USERNAME
/apps/v1/lib/hooks/ @YOUR_USERNAME

# =============================================================================
# UPDATER SERVICES
# =============================================================================

/apps/updaters/ @YOUR_USERNAME

# =============================================================================
# INFRASTRUCTURE
# =============================================================================

# Google Cloud Platform configuration
/gcp/ @YOUR_USERNAME

# Database migrations
/migration/ @YOUR_USERNAME

# =============================================================================
# DOCUMENTATION
# =============================================================================

/docs/ @YOUR_USERNAME
*.md @YOUR_USERNAME

# =============================================================================
# PROTECTED FILES
# These files have significant impact and require careful review
# =============================================================================

# GitHub configuration
/.github/ @YOUR_USERNAME
/.github/CODEOWNERS @YOUR_USERNAME
/.github/workflows/ @YOUR_USERNAME

# Project configuration
/package.json @YOUR_USERNAME
/package-lock.json @YOUR_USERNAME
/tsconfig.json @YOUR_USERNAME
/.env.example @YOUR_USERNAME

# Security-sensitive files
/SECURITY.md @YOUR_USERNAME
```

### Pattern Matching Rules

Per GITHUB.md:
- The last matching pattern takes precedence
- Use team handles (`@org/team-name`) for teams
- Patterns follow `.gitignore` syntax
- Directories should end with `/`

### When Teams Grow

For larger teams, consider patterns like:
```
/apps/v1/components/ @org/frontend-team
/apps/v1/lib/api/ @org/backend-team
/.github/ @org/devops-team
```

## Tasks

- [ ] Create `.github/CODEOWNERS` file
- [ ] Define default owner
- [ ] Add directory-specific patterns
- [ ] Protect critical files (CODEOWNERS, workflows)
- [ ] Enable "Require review from Code Owners" in branch protection
- [ ] Test by creating a PR to verify owners are requested

## Effort

**Size:** S (Small - < 1 hour)

## Dependencies

- Story 30.1 (`.github/` directory must exist)
- Story 30.10 (Branch protection enables CODEOWNERS requirement)

## References

- [GITHUB.md - CODEOWNERS](../../GITHUB.md#codeowners-automated-review-routing)
- [GitHub CODEOWNERS Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
