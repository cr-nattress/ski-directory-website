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

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We are committed to providing a welcoming and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Git
- Supabase account (for database access)

### Local Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/state-ski-resort-directory.git
   cd state-ski-resort-directory
   ```
3. Navigate to the main app:
   ```bash
   cd apps/v1
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```
6. Add your Supabase credentials to `.env.local`
7. Start development server:
   ```bash
   npm run dev
   ```

## Development Workflow

This project uses an **epic-based workflow**:

1. Check the `backlog/` directory for available epics
2. Create a feature branch from `master`:
   ```bash
   git checkout -b epic-{number}-{short-description}
   ```
3. Make your changes following the code style guidelines
4. Commit using conventional commit messages
5. Push to your fork and submit a Pull Request
6. Address any review feedback

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Epic | `epic-{number}-{description}` | `epic-25-grafana-observability` |
| Feature | `feature/{description}` | `feature/dark-mode` |
| Bug fix | `fix/{issue}-{description}` | `fix/123-map-zoom` |
| Hotfix | `hotfix/{description}` | `hotfix/security-patch` |

## Reporting Bugs

Before reporting a bug:

1. Search [existing issues](https://github.com/your-username/state-ski-resort-directory/issues) to avoid duplicates
2. If not found, [create a new issue](https://github.com/your-username/state-ski-resort-directory/issues/new/choose) using the **Bug Report** template

Include in your report:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

## Suggesting Features

1. Check [existing feature requests](https://github.com/your-username/state-ski-resort-directory/issues?q=label%3Aenhancement)
2. [Submit a feature request](https://github.com/your-username/state-ski-resort-directory/issues/new/choose) using the **Feature Request** template

Include:
- Problem you're trying to solve
- Proposed solution
- Alternative approaches considered
- Any mockups or examples

## Pull Request Process

1. Ensure your branch is up to date with `master`:
   ```bash
   git fetch origin
   git rebase origin/master
   ```

2. Run quality checks:
   ```bash
   cd apps/v1
   npm run lint
   npm run build
   ```

3. Fill out the PR template completely

4. Request review from maintainers

5. Address review feedback promptly

6. Once approved, a maintainer will merge your PR

### PR Requirements

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
- [ ] No new warnings introduced
- [ ] Changes tested locally
- [ ] PR template filled out

## Code Style

### TypeScript

- Strict mode enabled
- Explicit types preferred over `any`
- Use interfaces for object shapes
- Prefer `const` over `let`

### React

- Functional components with hooks
- Custom hooks for reusable logic
- Props interfaces defined and exported
- Use `cn()` utility for conditional classes

### Styling

- Tailwind CSS utility classes
- Mobile-first responsive design
- Use custom theme tokens (`ski-blue`, `powder-blue`, etc.)
- Avoid inline styles

### Imports

```typescript
// Use absolute imports with @/ prefix
import { ResortCard } from '@/components/ResortCard';
import { useResorts } from '@/lib/hooks/useResorts';
```

### File Organization

```
components/
├── ComponentName/
│   ├── index.ts          # Re-export
│   ├── ComponentName.tsx # Main component
│   └── types.ts          # Component types
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no new feature or fix |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies |

### Examples

```bash
feat(map): add zoom controls to resort map
fix(api): handle null coordinates in resort query
docs(readme): update installation instructions
refactor(hooks): extract shared caching logic
```

### Commit Footer

All commits should include:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Testing

### Manual Testing

Before submitting a PR:

- [ ] Test on Chrome, Firefox, and Safari
- [ ] Test on mobile viewport (375px width)
- [ ] Verify map functionality works
- [ ] Check for console errors

### Build Verification

```bash
cd apps/v1
npm run lint    # Check for linting errors
npm run build   # Verify production build succeeds
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Leaflet "window is not defined" | Use dynamic import with `ssr: false` |
| Hydration mismatch | Check for client-only code in server components |
| Type errors | Run `npx tsc --noEmit` to check all types |

## Questions?

- Check the [documentation](docs/)
- See [SUPPORT.md](SUPPORT.md) for help channels
- Review [CLAUDE.md](CLAUDE.md) for architecture details

Thank you for contributing!
