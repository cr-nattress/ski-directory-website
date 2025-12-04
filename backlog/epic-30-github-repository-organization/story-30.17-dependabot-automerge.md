# Story 30.17: Create Dependabot Auto-merge Workflow

## Description

Create a GitHub Actions workflow that automatically merges Dependabot pull requests for minor and patch version updates, reducing manual maintenance overhead while maintaining control over major version updates.

## Acceptance Criteria

- [ ] `.github/workflows/dependabot-automerge.yml` exists
- [ ] Auto-merges minor version updates
- [ ] Auto-merges patch version updates
- [ ] Does NOT auto-merge major version updates
- [ ] Requires CI checks to pass first
- [ ] Uses squash merge for clean history

## Technical Details

### Dependabot Auto-merge Workflow

```yaml
# .github/workflows/dependabot-automerge.yml
name: Dependabot Auto-merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    name: Auto-merge Dependabot PRs
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Fetch Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"

      - name: Auto-merge minor and patch updates
        if: >-
          steps.metadata.outputs.update-type == 'version-update:semver-minor' ||
          steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Log major updates (no auto-merge)
        if: steps.metadata.outputs.update-type == 'version-update:semver-major'
        run: |
          echo "::notice::Major version update detected - manual review required"
          echo "Package: ${{ steps.metadata.outputs.dependency-names }}"
          echo "Update type: ${{ steps.metadata.outputs.update-type }}"
          echo "New version: ${{ steps.metadata.outputs.new-version }}"
```

### How It Works

1. Dependabot creates a PR for a dependency update
2. CI workflow runs (lint, typecheck, build)
3. This workflow checks the update type:
   - **Minor/Patch**: Enables auto-merge (merges after CI passes)
   - **Major**: Logs notice, requires manual review

### Prerequisites

- Repository must have "Allow auto-merge" enabled (Settings > General)
- Branch protection rules with required status checks
- Dependabot must be configured (Story 30.7)

### Security Considerations

- Only merges from `dependabot[bot]` actor
- Requires CI to pass before merge
- Major versions require human review (breaking changes)
- Grouped updates still require manual review for major bumps

## Tasks

- [ ] Enable "Allow auto-merge" in repository settings
- [ ] Create `.github/workflows/dependabot-automerge.yml`
- [ ] Configure for minor and patch updates only
- [ ] Test with a minor dependency update
- [ ] Verify major updates are NOT auto-merged
- [ ] Document the auto-merge behavior in CONTRIBUTING.md

## Effort

**Size:** S (Small - < 1 hour)

## Dependencies

- Story 30.6 (CI Workflow must exist for status checks)
- Story 30.7 (Dependabot must be configured)
- Story 30.10 (Branch protection with required checks)

## References

- [GITHUB.md - Auto-merge Dependabot PRs](../../GITHUB.md#dependabot-configuration)
- [Dependabot Auto-merge](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions)
