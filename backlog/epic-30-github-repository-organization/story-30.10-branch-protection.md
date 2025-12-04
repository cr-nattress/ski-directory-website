# Story 30.10: Configure Branch Protection Rules

## Description

Configure branch protection rules for the `master` branch to enforce code review, status checks, and prevent accidental force pushes or deletions.

## Acceptance Criteria

- [ ] Branch protection rule exists for `master`
- [ ] Pull requests required for all changes
- [ ] At least 1 approval required
- [ ] Status checks required to pass
- [ ] Force pushes blocked
- [ ] Branch deletion blocked
- [ ] Stale reviews dismissed on new commits

## Technical Details

### Recommended Configuration

Per GITHUB.md for small teams (2-5 developers):

| Setting | Value | Reason |
|---------|-------|--------|
| Require pull request | Yes | No direct pushes to master |
| Required approvals | 1 | Balance between review and velocity |
| Dismiss stale reviews | Yes | Re-review after changes |
| Require status checks | Yes | CI must pass |
| Require branches up to date | Yes | Prevent merge conflicts |
| Restrict force pushes | Yes | Preserve history |
| Restrict deletions | Yes | Prevent accidents |

### Status Checks to Require

After CI workflow (Story 30.6) is implemented:
- `Lint`
- `Type Check`
- `Build`

### Configuration Steps

1. Go to **Settings** > **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `master`
4. Enable settings as specified above

### GitHub CLI Alternative

```bash
gh api repos/{owner}/{repo}/branches/master/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Lint","Type Check","Build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"dismiss_stale_reviews":true,"required_approving_review_count":1}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Tasks

- [ ] Navigate to repository Settings > Branches
- [ ] Create branch protection rule for `master`
- [ ] Enable "Require pull request before merging"
- [ ] Set required approvals to 1
- [ ] Enable "Dismiss stale reviews"
- [ ] Enable "Require status checks to pass"
- [ ] Add required status checks (after CI is set up)
- [ ] Disable force pushes
- [ ] Disable deletions
- [ ] Test by attempting direct push to master

## Effort

**Size:** S (Small - < 1 hour)

## Dependencies

- Story 30.6 (CI Workflow) should be completed first to have status checks available

## References

- [GITHUB.md - Branch protection rules](../../GITHUB.md#branch-protection-rules)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
