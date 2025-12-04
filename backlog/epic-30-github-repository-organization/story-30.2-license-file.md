# Story 30.2: Add LICENSE File

## Description

Add a LICENSE file to establish the legal foundation for the repository. The README currently states "This project is proprietary. All rights reserved." but no actual LICENSE file exists.

## Acceptance Criteria

- [ ] LICENSE file exists at repository root
- [ ] License type matches project requirements (proprietary)
- [ ] Copyright year and holder correctly specified
- [ ] GitHub recognizes and displays the license

## Technical Details

### Proprietary License Template

```
Copyright (c) 2024-2025 [Owner Name]. All Rights Reserved.

This software and associated documentation files (the "Software") are proprietary
and confidential. Unauthorized copying, modification, distribution, or use of this
Software, via any medium, is strictly prohibited.

The Software is provided "as is", without warranty of any kind, express or implied.

For licensing inquiries, contact: [contact email]
```

### Alternative: Consider Open Source

If open-sourcing is desired, common options per GITHUB.md:

| License | Use Case |
|---------|----------|
| MIT | Maximum permissiveness, minimal restrictions |
| Apache 2.0 | Permissive with explicit patent grant |
| GPL-3.0 | Copyleft requiring derivative works remain open source |

## Tasks

- [ ] Determine appropriate license type (confirm proprietary or choose OSS)
- [ ] Create LICENSE file at repository root
- [ ] Update README.md license section if needed
- [ ] Verify GitHub displays license badge correctly

## Effort

**Size:** S (Small - < 1 hour)

## References

- [GITHUB.md - LICENSE: legal foundation](../../GITHUB.md#license-legal-foundation)
- [choosealicense.com](https://choosealicense.com)
