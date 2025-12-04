# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Use GitHub's [private vulnerability reporting](https://github.com/your-username/state-ski-resort-directory/security/advisories/new) feature (preferred)
3. Or email security concerns directly to the repository owner

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (optional)

### Response Timeline

| Action | Target Time |
|--------|-------------|
| Initial Response | Within 48 hours |
| Status Update | Within 7 days |
| Critical Issue Resolution | Within 30 days |

### Disclosure Policy

- We will acknowledge receipt of your report
- We will investigate and keep you informed of progress
- We will credit reporters in security advisories (unless anonymity is requested)
- Please allow reasonable time for fixes before any public disclosure

## Security Best Practices

This project implements the following security measures:

- **Dependabot** - Automated dependency updates for security patches
- **CodeQL** - Semantic code analysis for vulnerability detection
- **Secret Scanning** - Detection of accidentally committed secrets
- **Push Protection** - Blocks commits containing secrets

## Security-Related Configuration

### Environment Variables

Sensitive configuration is managed through environment variables:

- Never commit `.env` files
- Use `.env.example` as a template (contains no secrets)
- Service account keys are explicitly gitignored

### Dependencies

- Dependencies are regularly updated via Dependabot
- Security advisories are monitored and addressed promptly
- npm audit is run as part of the CI process
