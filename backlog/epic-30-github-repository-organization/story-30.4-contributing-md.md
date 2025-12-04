# Story 30.4: Add CONTRIBUTING.md with Contribution Guidelines

## Description

Create a comprehensive CONTRIBUTING.md file that covers how to report bugs, suggest features, submit pull requests, code style requirements, testing expectations, and commit message conventions.

## Acceptance Criteria

- [ ] CONTRIBUTING.md file exists at repository root
- [ ] Bug reporting process documented
- [ ] Feature request process documented
- [ ] PR submission guidelines defined
- [ ] Code style requirements specified
- [ ] Testing expectations documented
- [ ] Commit message convention defined (Conventional Commits)

## Technical Details

### CONTRIBUTING.md Template

```markdown
# Contributing to Ski Resort Directory

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Testing](#testing)

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/state-ski-resort-directory.git`
3. Install dependencies: `cd apps/v1 && npm install`
4. Copy environment template: `cp .env.example .env.local`
5. Start development server: `npm run dev`

## Development Workflow

This project uses an epic-based workflow:

1. Pick an epic from `backlog/`
2. Create a feature branch: `git checkout -b epic-{number}-{description}`
3. Make your changes
4. Submit a PR for review
5. Merge after approval

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, OS, Node version)
- Screenshots if applicable

## Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml) and include:

- Problem you're trying to solve
- Proposed solution
- Alternative approaches considered
- Any additional context

## Pull Request Process

1. Ensure your branch is up to date with `master`
2. Run linting: `npm run lint`
3. Run build: `npm run build`
4. Update documentation if needed
5. Fill out the PR template completely
6. Request review from maintainers
7. Address review feedback promptly

## Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** ESLint + Prettier (run `npm run lint`)
- **Components:** Functional components with hooks
- **Styling:** Tailwind CSS utility classes
- **Imports:** Absolute imports with `@/` prefix

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change that neither fixes bug nor adds feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.

### Examples

```
feat(map): add zoom controls to resort map
fix(api): handle null coordinates in resort query
docs(readme): update installation instructions
```

## Testing

- Run tests: `npm test` (when available)
- Ensure no TypeScript errors: `npm run build`
- Test responsive design on mobile viewports
- Verify map functionality with SSR disabled

## Questions?

See [SUPPORT.md](SUPPORT.md) for help channels.
```

## Tasks

- [ ] Create CONTRIBUTING.md at repository root
- [ ] Document development setup process
- [ ] Define code style requirements
- [ ] Specify commit message format
- [ ] Add testing guidelines
- [ ] Link to other community files

## Effort

**Size:** M (Medium - 1-3 hours)

## References

- [GITHUB.md - Supporting community health files](../../GITHUB.md#supporting-community-health-files)
- [Conventional Commits](https://www.conventionalcommits.org/)
