# Story 29.2: Enable TypeScript Strict Mode

## Priority: High

## Context

TypeScript strict mode is currently disabled (`strict: false`), which means important type safety checks are not enforced. This allows potential null reference errors, implicit any types, and other type issues to slip through.

## Current State

**Location:** `apps/v1/tsconfig.json:7`

**Current Code:**
```json
{
  "compilerOptions": {
    "strict": false
  }
}
```

## Requirements

1. Enable TypeScript strict mode incrementally
2. Fix all type errors that arise
3. Ensure build passes with strict checks enabled

## Implementation

### Phase 1: Enable `strictNullChecks` (Quick Win)

```json
{
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": true
  }
}
```

Run `npx tsc --noEmit` and fix null/undefined errors.

### Phase 2: Enable `noImplicitAny`

```json
{
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

Fix any implicit any types.

### Phase 3: Enable Full Strict Mode

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

This enables:
- `strictNullChecks`
- `noImplicitAny`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`
- `alwaysStrict`

### Common Fixes Required

1. **Null checks for optional properties:**
```typescript
// Before
const city = resort.majorCityName.toUpperCase();

// After
const city = resort.majorCityName?.toUpperCase() ?? 'Unknown';
```

2. **Type narrowing for arrays:**
```typescript
// Before
const first = items[0].name;

// After
const first = items[0]?.name ?? '';
```

3. **Environment variables:**
```typescript
// Before
const url = process.env.NEXT_PUBLIC_URL!;

// After
const url = process.env.NEXT_PUBLIC_URL;
if (!url) throw new Error('Missing URL');
```

## Acceptance Criteria

- [ ] `strict: true` enabled in tsconfig.json
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] All type assertions documented with comments if unavoidable
- [ ] No new `// @ts-ignore` or `// @ts-expect-error` comments

## Testing

1. Run TypeScript compiler: `npx tsc --noEmit`
2. Run build: `npm run build`
3. Run linter: `npm run lint`
4. Test application functionality manually

## Notes

- This may surface 50+ type errors initially
- Most will be null checks or implicit any
- Consider tackling in phases over multiple PRs

## Effort: Large (4-8 hours)
