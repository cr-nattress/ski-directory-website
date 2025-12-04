# Story 30.16: Add CodeQL Security Scanning Workflow

## Description

Configure CodeQL, GitHub's semantic code analysis engine, to automatically scan for security vulnerabilities in JavaScript/TypeScript code on push and pull requests.

## Acceptance Criteria

- [ ] `.github/workflows/codeql.yml` exists
- [ ] Scans JavaScript/TypeScript code
- [ ] Runs on push to main branches
- [ ] Runs on pull requests
- [ ] Scheduled weekly scan configured
- [ ] Security alerts appear in Security tab

## Technical Details

### CodeQL Workflow

```yaml
# .github/workflows/codeql.yml
name: "CodeQL"

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
  schedule:
    # Run weekly on Monday at 5:30 AM UTC
    - cron: '30 5 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
      actions: read

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript-typescript']

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          # Use security-extended for more thorough scanning
          queries: +security-extended

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

### Query Suites

| Suite | Description |
|-------|-------------|
| `security-extended` | Standard security queries + additional checks |
| `security-and-quality` | Security + code quality queries |
| Default | Standard security queries only |

### What CodeQL Detects

For JavaScript/TypeScript:
- SQL injection
- Cross-site scripting (XSS)
- Path traversal
- Code injection
- Insecure randomness
- Hardcoded credentials
- Prototype pollution
- And more...

## Tasks

- [ ] Create `.github/workflows/codeql.yml`
- [ ] Configure for JavaScript/TypeScript
- [ ] Set up push and PR triggers
- [ ] Add weekly schedule
- [ ] Enable code scanning in repository settings
- [ ] Verify scan results appear in Security tab
- [ ] Address any initial findings

## Effort

**Size:** M (Medium - 1-3 hours, including addressing initial findings)

## Dependencies

- Story 30.1 (`.github/` directory must exist)

## References

- [GITHUB.md - Code scanning with CodeQL](../../GITHUB.md#code-scanning-with-codeql)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [GitHub Code Scanning](https://docs.github.com/en/code-security/code-scanning)
