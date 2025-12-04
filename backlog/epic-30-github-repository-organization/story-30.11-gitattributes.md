# Story 30.11: Add `.gitattributes` for Line Ending Normalization

## Description

Create a `.gitattributes` file to normalize line endings across different operating systems and control GitHub's language statistics for the repository.

## Acceptance Criteria

- [ ] `.gitattributes` file exists at repository root
- [ ] Line endings normalized to LF for text files
- [ ] Binary files properly marked
- [ ] Shell scripts use LF endings
- [ ] Batch files use CRLF endings
- [ ] Documentation excluded from language stats
- [ ] Vendor/generated code excluded from language stats

## Technical Details

### .gitattributes File

```gitattributes
# Auto-detect text files and normalize line endings
* text=auto

# Force specific line endings for scripts
*.sh text eol=lf
*.bash text eol=lf

# Windows-specific files use CRLF
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf

# Source code files
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.json text eol=lf
*.md text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
*.css text eol=lf
*.html text eol=lf

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.webp binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
*.pdf binary

# Exclude from language statistics
docs/* linguist-documentation
*.md linguist-documentation
backlog/* linguist-documentation
research/* linguist-documentation
schemas/* linguist-documentation

# Exclude generated files from stats
*.lock linguist-generated
package-lock.json linguist-generated
apps/v1/.next/* linguist-generated

# Exclude vendored code
**/node_modules/* linguist-vendored
```

### Key Settings Explained

| Setting | Purpose |
|---------|---------|
| `text=auto` | Auto-detect text files and normalize |
| `eol=lf` | Force Unix-style line endings |
| `eol=crlf` | Force Windows-style line endings |
| `binary` | Don't process file (preserve as-is) |
| `linguist-documentation` | Exclude from language stats |
| `linguist-generated` | Mark as generated code |
| `linguist-vendored` | Mark as third-party code |

## Tasks

- [ ] Create `.gitattributes` at repository root
- [ ] Add line ending normalization rules
- [ ] Mark binary file types
- [ ] Configure linguist directives for accurate stats
- [ ] Run `git add --renormalize .` to apply to existing files (if needed)

## Effort

**Size:** S (Small - < 1 hour)

## References

- [GITHUB.md - .gitignore and .gitattributes](../../GITHUB.md#gitignore-and-gitattributes)
- [Git Documentation - gitattributes](https://git-scm.com/docs/gitattributes)
- [GitHub Linguist](https://github.com/github/linguist)
