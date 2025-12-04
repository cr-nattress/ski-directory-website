# Story 30.8: Create Issue Templates (Bug Report, Feature Request)

## Description

Create YAML-based issue templates for bug reports and feature requests. These templates enforce consistent reporting and ensure all necessary information is captured.

## Acceptance Criteria

- [ ] `.github/ISSUE_TEMPLATE/bug_report.yml` exists
- [ ] `.github/ISSUE_TEMPLATE/feature_request.yml` exists
- [ ] Templates use YAML form syntax
- [ ] Required fields properly marked
- [ ] Automatic labels applied
- [ ] Templates appear in issue creation UI

## Technical Details

### Bug Report Template

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a bug or unexpected behavior
title: "[Bug]: "
labels: ["bug", "triage"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report this bug!
        Please fill out the form below to help us understand and fix the issue.

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
      placeholder: Describe what went wrong...
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happened?
    validations:
      required: true

  - type: dropdown
    id: browser
    attributes:
      label: Browser
      description: What browser are you using?
      options:
        - Chrome
        - Firefox
        - Safari
        - Edge
        - Other
    validations:
      required: true

  - type: input
    id: os
    attributes:
      label: Operating System
      description: What OS are you using?
      placeholder: "e.g., Windows 11, macOS 14, iOS 17"
    validations:
      required: true

  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots
      description: If applicable, add screenshots to help explain your problem.

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context about the problem here.
```

### Feature Request Template

```yaml
# .github/ISSUE_TEMPLATE/feature_request.yml
name: Feature Request
description: Suggest a new feature or enhancement
title: "[Feature]: "
labels: ["enhancement", "triage"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a feature!
        Please describe your idea clearly to help us understand and evaluate it.

  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem does this feature solve? Is it related to a frustration?
      placeholder: "I'm always frustrated when..."
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like
      placeholder: "I would like to be able to..."
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Describe any alternative solutions or features you've considered.

  - type: dropdown
    id: area
    attributes:
      label: Feature Area
      description: What part of the application does this affect?
      options:
        - Map / Interactive Features
        - Resort Directory / Listing
        - Resort Detail Pages
        - Search / Filtering
        - Mobile Experience
        - Performance
        - Data / Content
        - Other
    validations:
      required: true

  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Add any other context, mockups, or screenshots about the feature request.

  - type: checkboxes
    id: contribution
    attributes:
      label: Contribution
      description: Would you be interested in contributing to this feature?
      options:
        - label: I would be willing to submit a PR for this feature
```

## Tasks

- [ ] Create `.github/ISSUE_TEMPLATE/bug_report.yml`
- [ ] Create `.github/ISSUE_TEMPLATE/feature_request.yml`
- [ ] Test templates by creating draft issues
- [ ] Verify labels are applied correctly
- [ ] Ensure required fields work as expected

## Effort

**Size:** S (Small - < 1 hour)

## References

- [GITHUB.md - Issues: structured work tracking](../../GITHUB.md#issues-structured-work-tracking)
- [GitHub Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
