# Error Resolutions

This document captures significant errors encountered during development and their resolutions for future reference.

---

## ERR-001: Missing Environment Variable in Production (Netlify)

**Date:** 2025-12-03

**Error Message:**
```
Uncaught (in promise) Error: Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
```

**Environment:** Netlify production deployment

**Symptoms:**
- Site worked locally but failed in production
- Error occurred in client-side JavaScript bundle
- Environment variables were confirmed set in Netlify dashboard with "All" scope
- Build logs showed env vars were available during build (masked as `****`)

### Root Cause

The `env.ts` configuration file used **getter functions** to access environment variables:

```typescript
// ❌ BROKEN - Getter pattern doesn't work with Next.js client bundles
export const env = {
  supabase: {
    get url() {
      return getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    },
  },
};

function getRequiredEnv(key: string): string {
  const value = process.env[key];  // Dynamic key access
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
```

**Why this fails:**

Next.js replaces `process.env.NEXT_PUBLIC_*` with literal values at **build time** through static analysis. However, this replacement only works for **direct property access** like:

```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL  // ✅ Gets replaced with actual value
```

Dynamic access patterns do NOT get replaced:

```typescript
process.env[key]           // ❌ NOT replaced - key is a variable
process.env['NEXT_PUBLIC_SUPABASE_URL']  // ❌ NOT replaced - string literal in brackets
```

When using getters, the actual `process.env` access happens at **runtime** (when the getter is called), not at build time. By runtime, `process.env` doesn't exist in the browser, so the value is `undefined`.

### Solution

Changed to **direct static access** at module initialization:

```typescript
// ✅ FIXED - Direct access gets inlined at build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const env = {
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  },
};
```

Also updated `supabase.ts` to handle empty strings gracefully during SSG:

```typescript
export const supabase: SupabaseClient<Database> = (() => {
  const url = env.supabase.url;
  const anonKey = env.supabase.anonKey;

  if (!url || !anonKey) {
    // During build/SSG, return placeholder client
    if (typeof window === 'undefined') {
      return createClient<Database>(
        'https://placeholder.supabase.co',
        'placeholder-key'
      );
    }
    throw new Error('Missing Supabase configuration.');
  }

  return createClient<Database>(url, anonKey);
})();
```

### Files Changed

- `apps/v1/lib/config/env.ts` - Changed from getters to direct static access
- `apps/v1/lib/supabase.ts` - Added graceful handling for missing env vars during SSG

### Key Takeaways

1. **Always use direct `process.env.NEXT_PUBLIC_*` access** - Never use dynamic key patterns or getters for client-side env vars in Next.js

2. **The `env:` section in `next.config.js` is not enough** - While it helps, the actual code must still use direct access patterns

3. **Build-time vs runtime** - `NEXT_PUBLIC_*` vars are replaced at build time, not available at runtime in the browser

4. **Test in production-like environments** - This issue only manifested in Netlify, not local development

### References

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- Commit: `37da0ca` - fix: Use direct env var access for Next.js client bundle inlining

---

## Template for Future Entries

```markdown
## ERR-XXX: Brief Title

**Date:** YYYY-MM-DD

**Error Message:**
\`\`\`
Paste exact error message here
\`\`\`

**Environment:** Local / Staging / Production (Platform)

**Symptoms:**
- What was observed
- When it occurred

### Root Cause

Explanation of why the error occurred.

### Solution

What was done to fix it, with code examples if applicable.

### Files Changed

- List of files modified

### Key Takeaways

1. Lessons learned
2. How to prevent in future

### References

- Links to docs, commits, or related issues
```
