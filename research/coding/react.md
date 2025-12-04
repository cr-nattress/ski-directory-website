# Next.js/React/TypeScript Best Practices Guideline

**A comprehensive reference for coding agents to write, review, and architect medium-sized Next.js applications following modern 2024-2025 best practices.**

This guideline covers both the **App Router** (Next.js 13+) and **Pages Router** approaches, providing actionable rules, patterns, and examples across performance, security, architecture, testing, accessibility, state management, API design, and TypeScript.

---

## 1. Next.js architecture and routing

### App Router vs Pages Router decision framework

The **App Router** (recommended for new projects) uses React Server Components by default, providing better performance and simpler data fetching. The **Pages Router** remains fully supported for existing applications.

| Feature | App Router | Pages Router |
|---------|-----------|--------------|
| Components | Server Components by default | Client Components only |
| Data fetching | `async` components, Server Actions | `getServerSideProps`, `getStaticProps` |
| Layouts | Nested `layout.tsx` files | `_app.tsx`, `_document.tsx` |
| Metadata | `metadata` export, `generateMetadata` | `next/head` |
| API endpoints | Route Handlers (`route.ts`) | API Routes (`pages/api`) |

### Server Components vs Client Components

**Use Server Components (default) when:**
- Fetching data from databases or APIs
- Accessing backend resources directly
- Keeping sensitive information server-side (API keys, tokens)
- Reducing client-side JavaScript bundle

**Use Client Components ('use client') when:**
- Using React hooks (`useState`, `useEffect`, `useReducer`)
- Adding event handlers (`onClick`, `onChange`)
- Using browser APIs (`localStorage`, `window`, geolocation)
- Using third-party libraries requiring client-side features

```tsx
// ✅ Server Component (default) - app/products/page.tsx
import { AddToCartButton } from '@/components/AddToCartButton'

export default async function ProductsPage() {
  const products = await db.product.findMany() // Direct database access
  
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          {product.name}
          <AddToCartButton productId={product.id} />
        </li>
      ))}
    </ul>
  )
}

// ✅ Client Component - components/AddToCartButton.tsx
'use client'
import { useState } from 'react'

export function AddToCartButton({ productId }: { productId: string }) {
  const [isAdding, setIsAdding] = useState(false)
  
  return (
    <button onClick={() => handleAdd(productId)} disabled={isAdding}>
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
```

### Critical directive rules

**The `'use client'` directive:**
- Place at the **top of the file**, above all imports
- Marks the boundary where everything below becomes client-side
- All child components automatically become Client Components

**The `'use server'` directive:**
- Creates **Server Actions** (POST endpoints), NOT Server Components
- Components are Server Components by default—no directive needed

```tsx
// ❌ WRONG - 'use server' doesn't make a Server Component
'use server'
export default function Page() { /* This creates a Server Action, not what you want */ }

// ✅ CORRECT - No directive needed for Server Components
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ✅ CORRECT - Server Action usage
'use server'
export async function createPost(formData: FormData) {
  await db.post.create({ data: { title: formData.get('title') } })
  revalidatePath('/posts')
}
```

### App Router file conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Unique UI for a route (required to make route accessible) |
| `layout.tsx` | Shared UI that preserves state across navigations |
| `loading.tsx` | Suspense loading UI for the route segment |
| `error.tsx` | Error boundary for the route segment |
| `not-found.tsx` | 404 UI for the route |
| `route.ts` | API endpoint (Route Handler) |
| `template.tsx` | Like layout but re-mounts on navigation |

### Data fetching patterns

**App Router - Server Components:**
```tsx
// ✅ Fetch directly in Server Components
export default async function Page() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 } // Cache for 1 hour
  }).then(r => r.json())
  
  return <PostList posts={posts} />
}

// ✅ Parallel data fetching
export default async function Page() {
  const [user, posts] = await Promise.all([
    getUser(),
    getPosts()
  ])
  return <Dashboard user={user} posts={posts} />
}

// ❌ DON'T fetch from your own API routes in Server Components
export default async function Page() {
  // This creates an unnecessary network hop
  const data = await fetch('http://localhost:3000/api/data')
}
```

**Pages Router:**
```tsx
// Static Generation with revalidation (ISR)
export const getStaticProps: GetStaticProps = async () => {
  const posts = await fetchPosts()
  return {
    props: { posts },
    revalidate: 60, // Regenerate every 60 seconds
  }
}

// Server-side Rendering
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res, params, query } = context
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59')
  
  const user = await getUserFromSession(req)
  return { props: { user } }
}
```

### Caching and revalidation

```tsx
// Time-based revalidation
export const revalidate = 3600 // Page-level config

const data = await fetch(url, {
  next: { revalidate: 3600 } // Per-request config
})

// On-demand revalidation in Server Actions
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  await db.post.create({ data: { /* ... */ } })
  revalidatePath('/posts')      // Revalidate by path
  revalidateTag('posts')        // Revalidate by tag
}

// Tag-based caching
const posts = await fetch(url, {
  next: { tags: ['posts'] }
})
```

---

## 2. TypeScript best practices

### Strict configuration

```json
// tsconfig.json - Recommended strict settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "isolatedModules": true
  }
}
```

### Type-safe routing

```tsx
// next.config.ts - Enable typed routes
const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
}

// Usage - TypeScript will error on invalid routes
import Link from 'next/link'
import type { Route } from 'next'

<Link href="/about">About</Link>                    // ✅ Valid
<Link href="/nonexistent">Bad</Link>                // ❌ Type error
<Link href={`/products/${id}` as Route}>Product</Link> // Dynamic routes
```

### Props and component typing

```tsx
// Extending HTML element props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
}

function Button({ variant, isLoading, children, ...props }: ButtonProps) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? <Spinner /> : children}
    </button>
  )
}

// Generic component pattern
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

### Typing page components

```tsx
// App Router page props (Next.js 15+)
interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page } = await searchParams
  // ...
}

// Route Handler typing
import { NextRequest, NextResponse } from 'next/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  return NextResponse.json({ id })
}
```

### Zod for runtime validation

```tsx
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18).optional(),
  role: z.enum(['admin', 'user', 'moderator']),
})

type User = z.infer<typeof UserSchema> // Infer TypeScript type

// Server Action with validation
'use server'
export async function createUser(formData: FormData) {
  const result = UserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  })
  
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }
  
  await db.user.create({ data: result.data })
  return { success: true }
}
```

### Type-safe environment variables

```tsx
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const env = envSchema.parse(process.env)

// Access with type safety
import { env } from '@/lib/env'
console.log(env.DATABASE_URL) // Typed as string
```

### Discriminated unions for state

```tsx
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function DataDisplay({ state }: { state: AsyncState<User> }) {
  switch (state.status) {
    case 'loading':
      return <Spinner />
    case 'error':
      return <Error message={state.error.message} /> // error is typed
    case 'success':
      return <UserCard user={state.data} />          // data is typed as User
    default:
      return <Button>Load Data</Button>
  }
}
```

### TypeScript anti-patterns to avoid

```tsx
// ❌ Using 'any'
function process(data: any) { /* ... */ }

// ✅ Use 'unknown' with type guards
function process(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase()
  }
}

// ❌ Type assertions without validation
const user = data as User

// ✅ Runtime type checking
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data
}

if (isUser(data)) {
  console.log(data.id) // Safely typed
}

// ❌ Optional chaining without handling undefined
const name = user?.profile?.name
doSomething(name) // Could be undefined!

// ✅ Provide fallback
const name = user?.profile?.name ?? 'Anonymous'
```

---

## 3. Performance optimization

### Image optimization with next/image

```tsx
import Image from 'next/image'

// Hero/LCP image - use priority for above-the-fold
<Image
  src="/hero.jpg"
  alt="Hero image description"
  width={1200}
  height={600}
  priority              // Preloads for LCP
  sizes="(max-width: 768px) 100vw, 1200px"
  quality={90}
/>

// Below-fold images - lazy load (default)
<Image
  src="/thumbnail.jpg"
  alt="Product thumbnail"
  width={400}
  height={300}
  placeholder="blur"    // Prevents CLS
  blurDataURL="data:image/..."
/>
```

**Image optimization rules:**
- ✅ Always specify `width` and `height` to prevent CLS
- ✅ Use `priority` for LCP images (hero, above-fold)
- ✅ Use `sizes` prop for responsive images
- ✅ Use `placeholder="blur"` for better UX
- ❌ Never use native `<img>` for important images
- ❌ Don't set `priority` on below-fold images

### Font optimization with next/font

```tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',        // Prevents FOIT
  variable: '--font-inter',
})

// In layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### Code splitting and dynamic imports

```tsx
import dynamic from 'next/dynamic'

// Component-level code splitting
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false  // Skip SSR for client-only components
})

// Named exports
const Modal = dynamic(() =>
  import('./components').then(mod => mod.Modal)
)

// Selective library imports - avoid importing entire libraries
// ❌ Bad
import _ from 'lodash'

// ✅ Good - tree-shakeable
import debounce from 'lodash/debounce'
```

### Core Web Vitals optimization

**LCP (Largest Contentful Paint) - Target < 2.5s:**
- Use `priority` on LCP images
- Preload critical assets
- Optimize server response time with edge functions

**INP (Interaction to Next Paint) - Target < 200ms:**
```tsx
import { useTransition, useDeferredValue } from 'react'

function Search({ items }: { items: string[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  
  // Expensive filtering runs with lower priority
  const results = useMemo(
    () => items.filter(item => item.includes(deferredQuery)),
    [deferredQuery, items]
  )
  
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ResultList results={results} />
    </>
  )
}
```

**CLS (Cumulative Layout Shift) - Target < 0.1:**
- Always set dimensions on images and videos
- Reserve space for dynamic content with min-height
- Use font-display: swap

### Performance anti-patterns

```tsx
// ❌ Client-side fetching for static data
'use client'
function Posts() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts)
  }, [])
}

// ✅ Fetch in Server Component
async function Posts() {
  const posts = await db.post.findMany()
  return <PostList posts={posts} />
}

// ❌ Adding 'use client' too high in the component tree
'use client'
export default function Layout({ children }) { /* ... */ }

// ✅ Keep 'use client' at the leaves
export default function Layout({ children }) {
  return (
    <div>
      <ServerHeader />
      <InteractiveNav /> {/* Only this has 'use client' */}
      {children}
    </div>
  )
}
```

---

## 4. Security best practices

### Authentication with Data Access Layer

**Critical (CVE-2025-29927):** Middleware alone is NOT sufficient for authentication. Always verify authentication in your Data Access Layer.

```tsx
// lib/dal.ts - Data Access Layer
import { cache } from 'react'
import { auth } from '@/auth'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user) return null
  
  // Return minimal DTO - never full user object
  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  }
})

export const verifySession = cache(async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
})

// Usage in Server Component
import { verifySession } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await verifySession().catch(() => redirect('/login'))
  return <Dashboard user={session} />
}
```

### Server Actions security

```tsx
'use server'
import { z } from 'zod'
import { verifySession } from '@/lib/dal'

const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
})

export async function createPost(formData: FormData) {
  // 1. Always authenticate
  const user = await verifySession()
  
  // 2. Validate input with Zod
  const result = CreatePostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })
  
  if (!result.success) {
    return { error: 'Invalid fields', details: result.error.flatten() }
  }
  
  // 3. Perform action with validated data
  await db.post.create({
    data: { ...result.data, authorId: user.id }
  })
  
  revalidatePath('/posts')
  return { success: true }
}
```

### Secure headers configuration

```js
// next.config.js
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline';" },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
```

### XSS and SQL injection prevention

```tsx
// XSS Prevention
// ✅ React auto-escapes by default
<div>{userInput}</div>

// ✅ Sanitize HTML content
import DOMPurify from 'dompurify'
const cleanHtml = DOMPurify.sanitize(dirtyHtml)
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />

// ❌ Never do this with unsanitized user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// SQL Injection Prevention
// ✅ Use parameterized queries
import { sql } from '@vercel/postgres'
const [rows] = await sql`SELECT * FROM users WHERE id = ${userId}`

// ✅ Use ORMs (Prisma, Drizzle)
const user = await prisma.user.findUnique({ where: { id: userId } })

// ❌ Never interpolate user input into SQL
const query = `SELECT * FROM users WHERE id = '${userId}'` // VULNERABLE
```

### Environment variable security

```bash
# Server-only secrets (no NEXT_PUBLIC_ prefix)
DATABASE_URL=postgres://...
AUTH_SECRET=your-secret-key
API_KEY=sk-...

# Client-safe variables (NEXT_PUBLIC_ prefix required)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_NAME=My App
```

```tsx
// lib/env.ts - Centralize and validate env access
import 'server-only' // Prevents client import

export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL!,
  authSecret: process.env.AUTH_SECRET!,
}
```

### Security checklist

**✅ DO:**
- Authenticate in Server Actions and API routes (not just middleware)
- Validate all inputs with Zod or similar
- Return minimal DTOs to clients
- Use parameterized queries/ORMs
- Set security headers (CSP, HSTS)
- Implement rate limiting
- Use HTTP-only, Secure, SameSite cookies
- Mark server-only modules with `import 'server-only'`

**❌ DON'T:**
- Rely solely on middleware for authentication
- Pass full database objects to client components
- Use dangerouslySetInnerHTML without sanitization
- Trust client-provided data without validation
- Store secrets without NEXT_PUBLIC_ prefix exposure

---

## 5. API design patterns

### Route Handlers (App Router)

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
  
  const users = await db.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    select: { id: true, name: true, email: true },
  })
  
  return NextResponse.json({ data: users, page, limit })
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const validated = CreateUserSchema.parse(body)
    const user = await db.user.create({ data: validated })
    
    return NextResponse.json({ data: user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### Typed API responses

```tsx
// types/api.ts
export interface ApiResponse<T> {
  data?: T
  error?: string
  errors?: Record<string, string[]>
  meta?: { page: number; limit: number; total: number }
}

// lib/api-errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', errors: error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  
  console.error('Unhandled API error:', error)
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
```

### Error handling patterns

```tsx
// app/error.tsx - Route error boundary
'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
    // Log to error reporting service
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}

// Using notFound() for 404s
import { notFound } from 'next/navigation'

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id)
  if (!user) notFound()
  return <UserProfile user={user} />
}
```

---

## 6. State management

### State management decision tree

```
What kind of state?
├── Server data (API responses)
│   └── TanStack Query / SWR / Server Components
├── URL state (search, filters, pagination)
│   └── nuqs or useSearchParams
├── Form state
│   └── react-hook-form + Zod
└── Client state
    ├── Local to component → useState
    ├── Complex local logic → useReducer
    ├── Shared across few components → lift state up
    ├── App-wide theme/auth → React Context
    ├── Medium complexity → Zustand
    ├── Fine-grained reactivity → Jotai
    └── Large enterprise app → Redux Toolkit
```

### React Context for global UI state

```tsx
// context/theme.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
} | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

### Zustand for client-side state

```tsx
// stores/useCartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartStore {
  items: { id: string; quantity: number }[]
  addItem: (id: string) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (id) => set((state) => ({
        items: [...state.items, { id, quantity: 1 }]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }
  )
)
```

### TanStack Query for server state

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

### URL state with nuqs

```tsx
'use client'
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs'

function SearchFilters() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={() => setPage(p => p + 1)}>Next Page</button>
    </div>
  )
}
```

### Form state with react-hook-form

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await submitAction(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <textarea {...register('message')} />
      {errors.message && <span>{errors.message.message}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}
```

---

## 7. React patterns and hooks

### useEffect best practices

```tsx
// ✅ Proper cleanup with AbortController
useEffect(() => {
  const controller = new AbortController()
  
  async function fetchData() {
    try {
      const response = await fetch('/api/data', { signal: controller.signal })
      const data = await response.json()
      setData(data)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setError(error)
      }
    }
  }
  
  fetchData()
  return () => controller.abort()
}, [])

// ✅ Timer cleanup
useEffect(() => {
  const intervalId = setInterval(() => setCount(c => c + 1), 1000)
  return () => clearInterval(intervalId)
}, [])

// ❌ DON'T sync derived state
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// ✅ DO calculate during render
const fullName = `${firstName} ${lastName}`
```

### Memoization patterns

```tsx
// useMemo - for expensive calculations
function ProductList({ products, filter }: Props) {
  const filtered = useMemo(
    () => products.filter(p => p.category === filter),
    [products, filter]
  )
  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}

// useCallback - for stable function references passed to children
function Parent() {
  const handleClick = useCallback(() => {
    console.log('Clicked')
  }, [])
  
  return <MemoizedChild onClick={handleClick} />
}

// React.memo - prevent re-renders when props unchanged
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* expensive render */}</div>
})
```

### Concurrent features

```tsx
// useTransition - for state updates you control
function SearchWithTransition() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value) // Urgent update
    
    startTransition(() => {
      // Low priority - can be interrupted
      setResults(filterItems(e.target.value))
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Loading...</p>}
      <ResultsList results={results} />
    </>
  )
}

// useDeferredValue - when you don't control the state update
function DeferredSearch({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery
  
  const results = useMemo(
    () => filterItems(deferredQuery),
    [deferredQuery]
  )

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <ResultsList results={results} />
    </div>
  )
}
```

### Common hook mistakes

```tsx
// ❌ Stale closure
useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1) // Always uses initial count
  }, 1000)
  return () => clearInterval(interval)
}, []) // count not in deps

// ✅ Functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(c => c + 1) // Uses latest count
  }, 1000)
  return () => clearInterval(interval)
}, [])

// ❌ Object in deps causing infinite loops
useEffect(() => {
  doSomething(options) // options recreated every render
}, [options])

// ✅ Extract specific values
const optionValue = options.value
useEffect(() => {
  doSomething(optionValue)
}, [optionValue])
```

---

## 8. Testing strategies

### Jest and React Testing Library setup

```typescript
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)

// jest.setup.ts
import '@testing-library/jest-dom'
```

### Component testing

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

describe('Counter', () => {
  it('increments count on button click', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    expect(screen.getByTestId('count')).toHaveTextContent('0')
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })
})
```

### Mocking Next.js modules

```tsx
// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  json: () => Promise.resolve({ data: 'mocked' }),
  ok: true,
})
```

### Custom hook testing

```tsx
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter(0))
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

### E2E testing with Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
})

// tests/navigation.spec.ts
import { test, expect } from '@playwright/test'

test('navigation flow', async ({ page }) => {
  await page.goto('/')
  await page.click('text=About')
  await expect(page).toHaveURL('/about')
  await expect(page.locator('h1')).toContainText('About')
})
```

### Accessibility testing

```tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

## 9. Accessibility (a11y)

### Semantic HTML

```tsx
// ✅ Semantic structure
const Page = () => (
  <>
    <header>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <article>
        <h1>Page Title</h1>
        <section aria-labelledby="section-heading">
          <h2 id="section-heading">Section</h2>
          <p>Content...</p>
        </section>
      </article>
    </main>
    <footer>© 2024</footer>
  </>
)

// ❌ Div soup - avoid
const BadPage = () => (
  <div className="header">
    <div className="nav">...</div>
  </div>
)
```

### Form accessibility

```tsx
const AccessibleForm = () => (
  <form onSubmit={handleSubmit} noValidate>
    <div>
      <label htmlFor="email">Email (required)</label>
      <input
        type="email"
        id="email"
        name="email"
        aria-required="true"
        aria-invalid={errors.email ? 'true' : 'false'}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />
      {errors.email && (
        <span id="email-error" role="alert">
          {errors.email}
        </span>
      )}
    </div>
    
    <fieldset>
      <legend>Notification Preferences</legend>
      <label>
        <input type="checkbox" name="email-notifications" />
        Email notifications
      </label>
    </fieldset>
    
    <button type="submit">Submit</button>
  </form>
)
```

### Keyboard navigation and focus management

```tsx
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null)
  const previousFocus = useRef(null)

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement
      modalRef.current?.focus()
    }
    return () => {
      previousFocus.current?.focus() // Restore focus on close
    }
  }, [isOpen])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    // Focus trap logic for Tab key
  }

  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
}
```

### Skip links and landmarks

```tsx
const SkipLink = () => (
  <a
    href="#main-content"
    className="skip-link" // Position off-screen, visible on focus
  >
    Skip to main content
  </a>
)

const Layout = ({ children }) => (
  <>
    <SkipLink />
    <header role="banner">
      <nav role="navigation" aria-label="Main">...</nav>
    </header>
    <main id="main-content" role="main" tabIndex={-1}>
      {children}
    </main>
    <aside role="complementary" aria-label="Sidebar">...</aside>
    <footer role="contentinfo">...</footer>
  </>
)
```

### Image alt text patterns

```tsx
// Informative images - describe content
<img src="chart.png" alt="Sales increased 25% from Q1 to Q2 2024" />

// Decorative images - empty alt
<img src="decorative.png" alt="" role="presentation" />

// Complex images - longer description
<figure>
  <img
    src="diagram.png"
    alt="Architecture diagram"
    aria-describedby="diagram-desc"
  />
  <figcaption id="diagram-desc">
    Detailed description of the diagram...
  </figcaption>
</figure>

// Next.js Image - always include alt
<Image src="/hero.jpg" alt="Team collaborating" width={800} height={600} />
```

### Accessibility checklist

**✅ DO:**
- Use semantic HTML elements (header, nav, main, article, section)
- Associate labels with form inputs using `htmlFor`/`id`
- Provide keyboard navigation for all interactive elements
- Maintain 4.5:1 color contrast for text
- Include descriptive alt text for informative images
- Test with screen readers (NVDA, VoiceOver)
- Provide visible focus indicators

**❌ DON'T:**
- Remove focus outlines without replacement
- Use only color to convey information
- Skip heading levels (h1 → h3)
- Use divs for interactive elements (use buttons, links)
- Forget ARIA labels for icon-only buttons

---

## 10. Code organization

### Recommended folder structure

```
src/
├── app/                      # App Router
│   ├── (auth)/              # Route group for auth pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Route group for dashboard
│   │   ├── settings/
│   │   └── profile/
│   ├── api/                 # API routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   └── Modal/
│   ├── forms/               # Form components
│   └── layout/              # Layout components
├── hooks/                   # Custom hooks
├── lib/                     # Utilities, API clients
│   ├── dal.ts              # Data Access Layer
│   ├── env.ts              # Environment validation
│   └── utils.ts
├── stores/                  # State management (Zustand, etc.)
├── types/                   # TypeScript types
├── constants/               # Constants and config
└── services/                # API services
```

### Component file organization

```
components/
└── Button/
    ├── Button.tsx           # Main component
    ├── Button.test.tsx      # Colocated tests
    ├── Button.module.css    # Styles
    ├── types.ts             # Component-specific types
    └── index.ts             # Barrel export
```

### Route groups for organization

```
app/
├── (marketing)/             # Route group - no URL impact
│   ├── layout.tsx          # Marketing-specific layout
│   ├── about/page.tsx      # /about
│   └── blog/page.tsx       # /blog
├── (shop)/                  # Another route group
│   ├── layout.tsx          # Shop-specific layout
│   └── products/page.tsx   # /products
├── _lib/                    # Private folder (underscore prefix)
│   └── utils.ts            # Not routable
└── page.tsx                 # /
```

### Naming conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `Button.tsx`, `UserCard.tsx` |
| Hooks | camelCase with use prefix | `useAuth.ts`, `useDebounce.ts` |
| Utilities | camelCase | `formatDate.ts`, `api.ts` |
| Types | PascalCase | `User`, `ApiResponse` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_ITEMS` |
| Test files | `.test.tsx` or `.spec.tsx` | `Button.test.tsx` |

---

## Quick reference tables

### App Router file conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Route UI (required for route) |
| `layout.tsx` | Shared layout (preserves state) |
| `loading.tsx` | Suspense loading UI |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 UI |
| `route.ts` | API endpoint |

### Data fetching quick guide

| Need | Solution |
|------|----------|
| Static data | Server Component + fetch (cached) |
| Dynamic data | Server Component + `cache: 'no-store'` |
| Periodic revalidation | `revalidate: seconds` option |
| On-demand revalidation | `revalidatePath()` / `revalidateTag()` |
| Client mutations | Server Actions with forms |

### When to use each state solution

| Scenario | Solution |
|----------|----------|
| Local UI state | `useState` |
| Complex local logic | `useReducer` |
| Form management | `react-hook-form` + Zod |
| Server data caching | TanStack Query / SWR |
| URL state (search, pagination) | `nuqs` / `useSearchParams` |
| Global UI state (theme) | React Context |
| Medium client state | Zustand |
| Fine-grained reactivity | Jotai |

---

## Summary: coding agent action items

When **writing new code:**
1. Default to Server Components; add `'use client'` only when needed
2. Validate all inputs with Zod
3. Use TypeScript strict mode
4. Include proper error boundaries
5. Add accessibility attributes
6. Follow the folder structure conventions

When **reviewing code:**
1. Check for authentication in Server Actions and API routes
2. Verify no sensitive data passes to client components
3. Ensure proper TypeScript types (no `any`)
4. Validate accessibility (semantic HTML, ARIA, focus management)
5. Check for proper error handling and loading states
6. Verify cleanup in useEffect hooks

When **making architectural decisions:**
1. Choose data fetching strategy based on data freshness needs
2. Select state management based on complexity (start simple)
3. Use URL state for shareable UI state
4. Keep Server/Client component boundary at the leaves
5. Implement security at the Data Access Layer, not just middleware

When **optimizing performance:**
1. Use `next/image` with proper sizing
2. Implement code splitting with dynamic imports
3. Cache appropriately with revalidation strategies
4. Minimize client-side JavaScript
5. Use concurrent features for expensive computations