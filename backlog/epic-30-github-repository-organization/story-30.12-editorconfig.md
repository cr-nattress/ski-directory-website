# Story 30.12: Add `.editorconfig` for Consistent Coding Styles

## Description

Create an `.editorconfig` file to define consistent coding styles across different editors and IDEs. This ensures all contributors use the same indentation, line endings, and formatting regardless of their editor.

## Acceptance Criteria

- [ ] `.editorconfig` file exists at repository root
- [ ] Indent style set to spaces
- [ ] Indent size set to 2 for most files
- [ ] UTF-8 charset specified
- [ ] Trailing whitespace trimmed
- [ ] Final newline inserted
- [ ] Language-specific overrides where needed

## Technical Details

### .editorconfig File

```ini
# EditorConfig helps maintain consistent coding styles
# https://editorconfig.org

# Top-most EditorConfig file
root = true

# Default settings for all files
[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

# TypeScript/JavaScript files
[*.{ts,tsx,js,jsx}]
indent_size = 2

# JSON files
[*.json]
indent_size = 2

# YAML files
[*.{yml,yaml}]
indent_size = 2

# Markdown files
[*.md]
# Trailing whitespace can be significant in Markdown
trim_trailing_whitespace = false

# Makefiles require tabs
[Makefile]
indent_style = tab

# Shell scripts
[*.sh]
end_of_line = lf

# Windows batch files
[*.{bat,cmd}]
end_of_line = crlf

# Package files - don't modify (generated)
[package-lock.json]
indent_size = 2

# SQL files
[*.sql]
indent_size = 4
```

### Settings Explained

| Setting | Value | Reason |
|---------|-------|--------|
| `indent_style` | space | Consistent display across all editors |
| `indent_size` | 2 | Standard for TypeScript/JavaScript |
| `charset` | utf-8 | Universal encoding support |
| `end_of_line` | lf | Unix-style line endings |
| `insert_final_newline` | true | POSIX compliance |
| `trim_trailing_whitespace` | true | Clean diffs |

### Editor Support

Most modern editors support EditorConfig natively or via plugin:
- VS Code: Built-in
- WebStorm/IntelliJ: Built-in
- Vim: Plugin required
- Sublime Text: Plugin required

## Tasks

- [ ] Create `.editorconfig` at repository root
- [ ] Set root = true
- [ ] Configure default settings
- [ ] Add TypeScript/JavaScript overrides
- [ ] Add Markdown exception for trailing whitespace
- [ ] Add Makefile exception for tabs
- [ ] Test in different editors

## Effort

**Size:** S (Small - < 1 hour)

## References

- [EditorConfig](https://editorconfig.org/)
- [GITHUB.md - Standard Directory Structure](../../GITHUB.md#standard-directory-structure)
