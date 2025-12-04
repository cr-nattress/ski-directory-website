# Story 30.7: Add Dependabot Configuration

## Description

Configure Dependabot to automatically create pull requests for dependency updates, keeping the project secure and up-to-date with minimal manual effort.

## Acceptance Criteria

- [ ] `.github/dependabot.yml` file exists
- [ ] Configured for npm ecosystem (apps/v1)
- [ ] Configured for GitHub Actions ecosystem
- [ ] Weekly update schedule set
- [ ] PR limits configured to avoid overwhelming
- [ ] Dependency groups configured for batched updates

## Technical Details

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2

updates:
  # Main Next.js application
  - package-ecosystem: "npm"
    directory: "/apps/v1"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "America/Denver"
    open-pull-requests-limit: 5
    groups:
      # Group minor/patch production deps together
      production-dependencies:
        dependency-type: "production"
        update-types:
          - "minor"
          - "patch"
      # Group all dev dependencies together
      dev-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore(deps)"

  # Wikipedia updater
  - package-ecosystem: "npm"
    directory: "/apps/updaters/wikipedia-updater"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 3
    labels:
      - "dependencies"
      - "updaters"

  # Liftie sync
  - package-ecosystem: "npm"
    directory: "/apps/updaters/liftie-sync"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 3
    labels:
      - "dependencies"
      - "updaters"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      actions:
        patterns:
          - "*"
    labels:
      - "dependencies"
      - "ci"
```

### Configuration Explained

| Setting | Value | Reason |
|---------|-------|--------|
| `interval` | weekly | Balance between freshness and PR volume |
| `day` | monday | Start of week for review |
| `open-pull-requests-limit` | 5 | Prevent overwhelming with PRs |
| `groups` | prod/dev split | Batch related updates |
| `labels` | dependencies | Easy filtering |

## Tasks

- [ ] Create `.github/dependabot.yml`
- [ ] Configure npm ecosystem for apps/v1
- [ ] Configure npm ecosystem for updater apps
- [ ] Configure GitHub Actions ecosystem
- [ ] Set up dependency grouping
- [ ] Add appropriate labels
- [ ] Enable Dependabot in repository settings

## Effort

**Size:** S (Small - < 1 hour)

## References

- [GITHUB.md - Dependabot configuration](../../GITHUB.md#dependabot-configuration)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
