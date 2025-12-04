# Story 30.19: Enhance `.gitignore` with Comprehensive Patterns

## Description

Expand the existing `.gitignore` file with comprehensive patterns for Node.js, TypeScript, Next.js, IDE files, and common development artifacts.

## Acceptance Criteria

- [ ] All common Node.js patterns included
- [ ] TypeScript/Next.js build artifacts ignored
- [ ] IDE and editor files ignored
- [ ] OS-specific files ignored
- [ ] Logs and debug files ignored
- [ ] Test coverage artifacts ignored
- [ ] Secrets and credentials patterns added
- [ ] Organized with clear section comments

## Technical Details

### Enhanced .gitignore

```gitignore
# =============================================================================
# DEPENDENCIES
# =============================================================================
node_modules/
.pnp
.pnp.js

# =============================================================================
# BUILD OUTPUTS
# =============================================================================
dist/
build/
.next/
out/

# TypeScript
*.tsbuildinfo
next-env.d.ts

# =============================================================================
# ENVIRONMENT & SECRETS
# =============================================================================
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Service account keys - NEVER commit these
**/service-account-key.json
*.key.json
*.pem
secrets/
credentials/

# =============================================================================
# LOGS & DEBUG
# =============================================================================
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# =============================================================================
# TESTING & COVERAGE
# =============================================================================
coverage/
.nyc_output/
*.lcov

# Playwright
/test-results/
/playwright-report/
/playwright/.cache/

# =============================================================================
# IDE & EDITORS
# =============================================================================
# VS Code
.vscode/
!.vscode/extensions.json
!.vscode/settings.json.example

# JetBrains (WebStorm, IntelliJ)
.idea/
*.iml
*.iws
*.ipr

# Vim
*.swp
*.swo
*~
.vim/

# Sublime Text
*.sublime-project
*.sublime-workspace

# =============================================================================
# OPERATING SYSTEMS
# =============================================================================
# macOS
.DS_Store
.AppleDouble
.LSOverride
._*
.Spotlight-V100
.Trashes

# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/

# Linux
*~
.fuse_hidden*
.directory
.Trash-*
.nfs*

# =============================================================================
# MISC
# =============================================================================
# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Yarn
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# Vercel
.vercel

# Turbo
.turbo

# Debug
.debug/

# Cache
.cache/
.parcel-cache/
.eslintcache

# Local development
*.local

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Storybook
storybook-static/
```

### Changes from Current .gitignore

Current file is minimal (25 lines). This expansion adds:
- Comprehensive log patterns
- Test coverage directories
- More IDE/editor patterns
- OS-specific files (Linux)
- Modern tooling (Turbo, Playwright, Storybook)
- Better organized with section headers

## Tasks

- [ ] Backup current `.gitignore`
- [ ] Add missing patterns organized by section
- [ ] Verify no important files are accidentally ignored
- [ ] Test that existing tracked files remain tracked
- [ ] Commit the enhanced `.gitignore`

## Effort

**Size:** S (Small - < 1 hour)

## References

- [GITHUB.md - .gitignore and .gitattributes](../../GITHUB.md#gitignore-and-gitattributes)
- [GitHub gitignore templates](https://github.com/github/gitignore)
- [gitignore.io](https://www.toptal.com/developers/gitignore)
