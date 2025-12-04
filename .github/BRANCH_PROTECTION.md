# Branch Protection Configuration

This document describes the recommended branch protection rules for the `master` branch.

## Current Status: DISABLED

Branch protection is currently **disabled** for this repository to allow for rapid development. The settings below are documented for future implementation when the project matures.

---

## Manual Configuration Required

Branch protection rules must be configured manually in GitHub:

**Settings > Branches > Add branch protection rule**

## Recommended Settings for `master` (Future Implementation)

### Branch name pattern
```
master
```

### Protect matching branches

#### Require a pull request before merging
- [] **Enabled**
- [] Require approvals: **1**
- [] Dismiss stale pull request approvals when new commits are pushed
- [ ] Require review from Code Owners (enable after CODEOWNERS is tested)
- [ ] Require approval of the most recent reviewable push

#### Require status checks to pass before merging
- [x] **Enabled**
- [x] Require branches to be up to date before merging

**Required status checks:**
- `Lint`
- `Type Check`
- `Build`

#### Require conversation resolution before merging
- [] **Enabled**

#### Require signed commits
- [ ] Optional (enable for higher security)

#### Require linear history
- [ ] Optional (enable for cleaner git log)

#### Do not allow bypassing the above settings
- [ ] Optional (enable to prevent admin bypass)

### Rules applied to everyone including administrators

#### Allow force pushes
- [ ] **Disabled** - Prevent history rewriting

#### Allow deletions
- [ ] **Disabled** - Prevent accidental branch deletion

## GitHub CLI Command

Alternatively, use the GitHub CLI to configure protection:

```bash
gh api repos/{owner}/state-ski-resort-directory/branches/master/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Lint","Type Check","Build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"dismiss_stale_reviews":true,"required_approving_review_count":1}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Verification

After configuration, verify by:

1. Attempting to push directly to `master` (should fail)
2. Creating a PR without CI passing (should block merge)
3. Creating a PR without approval (should block merge)
