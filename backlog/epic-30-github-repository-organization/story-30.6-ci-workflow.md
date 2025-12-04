# Story 30.6: Create GitHub Actions CI Workflow

## Description

Create a comprehensive CI workflow that runs linting, type checking, and builds on push and pull requests. This automates quality checks and prevents broken code from being merged.

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` exists
- [ ] Workflow triggers on push to `master` and on PRs
- [ ] Runs ESLint for code quality
- [ ] Runs TypeScript type checking
- [ ] Runs production build
- [ ] Uses caching for npm dependencies
- [ ] Includes concurrency controls to cancel redundant runs

## Technical Details

### CI Workflow Template

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  checks: write

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/v1
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/v1/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/v1
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/v1/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript type check
        run: npx tsc --noEmit

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    defaults:
      run:
        working-directory: apps/v1
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/v1/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### Key Features

- **Concurrency:** Cancels redundant runs on same branch
- **Caching:** Uses npm cache for faster builds
- **Parallel jobs:** Lint and typecheck run simultaneously
- **Build depends:** Build only runs if lint/typecheck pass
- **Working directory:** Set to `apps/v1` for monorepo structure

## Tasks

- [ ] Create `.github/workflows/ci.yml`
- [ ] Configure triggers for push and PR
- [ ] Add lint job with ESLint
- [ ] Add typecheck job with TypeScript
- [ ] Add build job with dependency on lint/typecheck
- [ ] Configure npm caching
- [ ] Add required secrets to repository settings
- [ ] Test workflow with a PR

## Effort

**Size:** M (Medium - 1-3 hours)

## References

- [GITHUB.md - CI/CD with GitHub Actions](../../GITHUB.md#cicd-with-github-actions)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
