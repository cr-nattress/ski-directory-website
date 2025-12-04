# Story 30.9: Create Pull Request Template

## Description

Create a pull request template that ensures consistent PR descriptions, proper testing documentation, and clear checklists for contributors.

## Acceptance Criteria

- [ ] `.github/PULL_REQUEST_TEMPLATE.md` exists
- [ ] Template includes description section
- [ ] Type of change checkboxes included
- [ ] Related issues section present
- [ ] Testing documentation required
- [ ] Pre-merge checklist included

## Technical Details

### Pull Request Template

```markdown
## Description

<!-- Brief description of the changes in this PR -->

## Type of Change

<!-- Check all that apply -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] CI/CD changes

## Related Issues

<!-- Link to related issues. Use "Closes #123" to auto-close issues on merge -->

Closes #

## Changes Made

<!-- Bulleted list of changes -->

-
-
-

## Testing

<!-- Describe how you tested these changes -->

### Manual Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile viewport

### Automated Testing
- [ ] Existing tests pass (`npm run build`)
- [ ] New tests added (if applicable)

## Screenshots

<!-- If applicable, add screenshots to demonstrate the changes -->

| Before | After |
|--------|-------|
|        |       |

## Checklist

<!-- Ensure all items are complete before requesting review -->

- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated documentation as needed
- [ ] My changes generate no new warnings
- [ ] I have tested my changes locally
- [ ] Any dependent changes have been merged

## Additional Notes

<!-- Any additional context, considerations, or notes for reviewers -->

```

### Template Sections Explained

| Section | Purpose |
|---------|---------|
| Description | Quick summary of what the PR does |
| Type of Change | Categorize for changelog and review |
| Related Issues | Link to issues for tracking |
| Changes Made | Detailed list of modifications |
| Testing | Document what was tested |
| Screenshots | Visual diff for UI changes |
| Checklist | Pre-review quality gates |

## Tasks

- [ ] Create `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Include all required sections
- [ ] Add testing checklist items
- [ ] Include pre-merge checklist
- [ ] Test template with a new PR

## Effort

**Size:** S (Small - < 1 hour)

## References

- [GITHUB.md - Pull request templates](../../GITHUB.md#pull-request-templates)
- [GitHub PR Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
