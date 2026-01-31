# Epic 47: Full CRUD API Implementation

## Overview
Implement complete CRUD (Create, Read, Update, Delete) operations for the resort data API. Currently the application only supports READ operations. This epic adds the missing CREATE, UPDATE, and DELETE endpoints with proper authentication, validation, and error handling.

## Business Value
- Enable administrative management of resort data through API
- Support future admin dashboard functionality
- Allow automated data pipeline updates via API
- Provide foundation for user-generated content (reviews, favorites)
- Enable third-party integrations via documented API

## Technical Context

### Current State
- **READ operations**: Planned but not implemented (no source code exists)
- **CREATE/UPDATE/DELETE**: Not planned
- **Authentication**: Supabase service role key available but unused
- **Data access**: Direct Supabase queries only

### Target State
- **Complete REST API**: Full CRUD for resorts, conditions, and supporting entities
- **Authentication**: Service role key for admin operations, anon key for public reads
- **Validation**: Zod schemas for request/response validation
- **Error handling**: Consistent error responses with proper HTTP status codes

---

## API Endpoints

### Public Endpoints (Anon Key)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/resorts` | READ | List resorts with pagination and filters |
| `GET /api/resorts/[slug]` | READ | Get single resort by slug |
| `GET /api/resorts/search` | READ | Full-text search resorts |
| `GET /api/map-pins` | READ | Lightweight map marker data |
| `GET /api/states` | READ | List all states/provinces |
| `GET /api/passes` | READ | List all pass programs |

### Admin Endpoints (Service Role Key Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/admin/resorts` | CREATE | Create new resort |
| `PUT /api/admin/resorts/[id]` | UPDATE | Update existing resort |
| `PATCH /api/admin/resorts/[id]` | UPDATE | Partial update resort |
| `DELETE /api/admin/resorts/[id]` | DELETE | Soft-delete resort |
| `POST /api/admin/conditions/[resortId]` | CREATE/UPDATE | Update resort conditions |

---

## User Stories

### Story 47.1: Project Structure Setup
**As a** developer
**I want** the proper Next.js app structure created
**So that** I can implement API routes and services

**Acceptance Criteria:**
- [ ] Create `apps/v1/app/` directory structure
- [ ] Create `apps/v1/lib/` directory structure
- [ ] Create `apps/v1/types/` directory structure
- [ ] Set up base Supabase client configuration
- [ ] Create shared utility functions

**Tasks:**
1. Create app directory with layout.tsx
2. Create lib/supabase.ts with client factory
3. Create lib/utils.ts with helper functions
4. Create types/supabase.ts with database types
5. Create types/api.ts with API response types

---

### Story 47.2: Public READ Endpoints
**As a** frontend developer
**I want** public API endpoints for reading resort data
**So that** client components can fetch data

**Acceptance Criteria:**
- [ ] `GET /api/resorts` returns paginated resort list
- [ ] `GET /api/resorts/[slug]` returns single resort
- [ ] `GET /api/resorts/search?q=` returns search results
- [ ] `GET /api/map-pins` returns lightweight pin data
- [ ] All endpoints include proper error handling
- [ ] Response times under 200ms for cached queries

**Tasks:**
1. Create `/api/resorts/route.ts` with list endpoint
2. Create `/api/resorts/[slug]/route.ts` with detail endpoint
3. Create `/api/resorts/search/route.ts` with search endpoint
4. Create `/api/map-pins/route.ts` with pins endpoint
5. Add query parameter validation
6. Add response caching headers

---

### Story 47.3: Resort Service Layer
**As a** developer
**I want** a service layer that abstracts database queries
**So that** API routes remain thin and logic is reusable

**Acceptance Criteria:**
- [ ] ResortService class with all CRUD methods
- [ ] Proper TypeScript types for all operations
- [ ] Error handling with custom error classes
- [ ] Transaction support for complex operations
- [ ] Audit logging for write operations

**Tasks:**
1. Create `lib/services/resort-service.ts`
2. Implement `getAll()`, `getBySlug()`, `search()` methods
3. Implement `create()`, `update()`, `delete()` methods
4. Create `lib/errors.ts` with custom error classes
5. Add audit logging utility

---

### Story 47.4: Admin Authentication Middleware
**As an** admin
**I want** protected API endpoints
**So that** only authorized users can modify data

**Acceptance Criteria:**
- [ ] Middleware validates service role key
- [ ] Returns 401 for missing/invalid auth
- [ ] Returns 403 for insufficient permissions
- [ ] Logs authentication attempts
- [ ] Rate limiting on admin endpoints

**Tasks:**
1. Create `lib/middleware/auth.ts`
2. Implement service role key validation
3. Add rate limiting configuration
4. Create admin route wrapper function
5. Add authentication logging

---

### Story 47.5: Admin CREATE Endpoint
**As an** admin
**I want** to create new resorts via API
**So that** I can add resorts without direct database access

**Acceptance Criteria:**
- [ ] `POST /api/admin/resorts` creates resort
- [ ] Request body validated with Zod schema
- [ ] Returns 201 with created resort
- [ ] Returns 400 for validation errors
- [ ] Returns 409 for duplicate slug
- [ ] Triggers index rebuild if needed

**Tasks:**
1. Create Zod schema for resort creation
2. Create `/api/admin/resorts/route.ts`
3. Implement POST handler
4. Add duplicate slug detection
5. Return proper response codes

---

### Story 47.6: Admin UPDATE Endpoint
**As an** admin
**I want** to update existing resorts via API
**So that** I can correct or enhance resort data

**Acceptance Criteria:**
- [ ] `PUT /api/admin/resorts/[id]` replaces resort
- [ ] `PATCH /api/admin/resorts/[id]` partial update
- [ ] Validates resort exists (404 if not)
- [ ] Validates request body
- [ ] Updates `updated_at` timestamp
- [ ] Returns updated resort

**Tasks:**
1. Create Zod schema for resort update
2. Create `/api/admin/resorts/[id]/route.ts`
3. Implement PUT handler (full replacement)
4. Implement PATCH handler (partial update)
5. Add optimistic locking if needed

---

### Story 47.7: Admin DELETE Endpoint
**As an** admin
**I want** to delete resorts via API
**So that** I can remove incorrect or duplicate entries

**Acceptance Criteria:**
- [ ] `DELETE /api/admin/resorts/[id]` soft-deletes resort
- [ ] Sets `is_active = false` and `deleted_at` timestamp
- [ ] Returns 204 on success
- [ ] Returns 404 if resort not found
- [ ] Option for hard delete with query param

**Tasks:**
1. Create `/api/admin/resorts/[id]/route.ts` DELETE handler
2. Implement soft delete logic
3. Add hard delete option (protected)
4. Update related records if needed
5. Clear caches on delete

---

### Story 47.8: Conditions API
**As a** data pipeline
**I want** to update resort conditions via API
**So that** real-time data stays current

**Acceptance Criteria:**
- [ ] `POST /api/admin/conditions/[resortId]` updates conditions
- [ ] Accepts snow, lift, and terrain status data
- [ ] Validates data ranges (e.g., terrain % 0-100)
- [ ] Updates `updated_at` timestamp
- [ ] Supports batch updates

**Tasks:**
1. Create Zod schema for conditions
2. Create `/api/admin/conditions/[resortId]/route.ts`
3. Implement upsert logic
4. Add batch endpoint option
5. Trigger real-time notifications

---

### Story 47.9: API Documentation
**As a** developer
**I want** API documentation
**So that** I can understand available endpoints

**Acceptance Criteria:**
- [ ] OpenAPI/Swagger spec generated
- [ ] All endpoints documented with examples
- [ ] Error responses documented
- [ ] Authentication requirements clear
- [ ] Rate limits documented

**Tasks:**
1. Create OpenAPI specification file
2. Document all endpoints
3. Add request/response examples
4. Generate TypeScript client types
5. Add to project README

---

## Technical Implementation

### Directory Structure

```
apps/v1/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── resorts/
│       │   ├── route.ts              # GET (list)
│       │   ├── search/route.ts       # GET (search)
│       │   └── [slug]/route.ts       # GET (detail)
│       ├── map-pins/
│       │   └── route.ts              # GET (pins)
│       ├── states/
│       │   └── route.ts              # GET (states)
│       ├── passes/
│       │   └── route.ts              # GET (passes)
│       └── admin/
│           ├── resorts/
│           │   ├── route.ts          # POST (create)
│           │   └── [id]/route.ts     # PUT, PATCH, DELETE
│           └── conditions/
│               └── [resortId]/route.ts  # POST (upsert)
├── lib/
│   ├── supabase.ts                   # Client factory
│   ├── utils.ts                      # Helpers
│   ├── errors.ts                     # Custom errors
│   ├── api/
│   │   ├── resort-service.ts         # Resort CRUD
│   │   ├── conditions-service.ts     # Conditions CRUD
│   │   └── supabase-adapter.ts       # Type transformations
│   └── middleware/
│       ├── auth.ts                   # Admin auth
│       └── rate-limit.ts             # Rate limiting
└── types/
    ├── supabase.ts                   # DB types
    ├── api.ts                        # API types
    └── resort.ts                     # Domain types
```

### Authentication Flow

```
Request → Check Authorization Header
            ↓
        Has Bearer Token?
            ↓ No → Return 401 Unauthorized
            ↓ Yes
        Token === SERVICE_ROLE_KEY?
            ↓ No → Return 403 Forbidden
            ↓ Yes
        Proceed to Handler
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;        // e.g., "VALIDATION_ERROR"
    message: string;     // Human-readable message
    details?: unknown;   // Additional context
  };
  status: number;        // HTTP status code
}
```

---

## Dependencies

- **Supabase**: Database client and auth
- **Zod**: Request/response validation
- **Next.js 14**: App Router for API routes

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| No rate limiting | API abuse | Implement middleware rate limiter |
| Service key exposure | Security breach | Use environment variables, audit logs |
| Schema drift | Runtime errors | Generate types from Supabase |
| N+1 queries | Performance | Use database views, batch queries |

## Success Metrics

- All CRUD operations functional
- API response time < 200ms (p95)
- Zero security vulnerabilities
- 100% TypeScript coverage
- API documentation complete

## Definition of Done

- [ ] All stories completed
- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] API documentation generated
- [ ] Security review passed
- [ ] Performance benchmarks met
