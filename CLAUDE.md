# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build (runs lint + TS checks)
npm run lint         # Run ESLint

# Testing
npm test                        # Run all Jest tests
npm run test:watch              # Watch mode
npm run test:coverage           # With coverage (70% threshold enforced)
npm run test:unit               # Unit tests only (components, hooks, lib, api)
npm run test:integration        # Integration tests
npm run test:auth               # Auth integration tests only
npm run test:courses            # Course integration tests only
npm run test:e2e                # Playwright E2E tests
npm run test:e2e:headed         # E2E with browser visible

# Database
npm run db:generate  # Generate Drizzle migrations from schema
npm run db:migrate   # Apply migrations to DB
npm run db:push      # Push schema directly (skip migrations)
npm run db:studio    # Open Drizzle Studio UI
npm run db:setup     # Seed initial data (roles, admin user)
npm run db:test      # Verify DB connection
```

To run a single test file:
```bash
npx jest __tests__/api/auth.test.ts
npx jest --testNamePattern="should login successfully"
```

## Architecture

### Stack
- **Next.js 15** App Router (React 18) with TypeScript
- **PostgreSQL** via Neon serverless + Drizzle ORM
- **Auth**: JWT (access + refresh tokens) in httpOnly cookies, bcrypt hashing
- **Edge-compatible token verification**: `jose` library in middleware; `jsonwebtoken` only in server-only contexts

### Directory Layout
```
app/
  (auth)/         # Sign-in, sign-up, reset-password pages (public)
  api/            # API route handlers organized by domain (auth, admin, company, student, etc.)
  workspace/
    admin/        # Admin dashboard pages
    company/      # Company manager pages
    student/      # Student pages
    _components/  # Shared workspace nav components
  types/          # Centralized TypeScript types (index.ts)
config/
  schema.ts       # All Drizzle table definitions and relations
lib/
  auth.ts         # Server-only JWT generation/verification (jsonwebtoken)
  auth-edge.ts    # Edge-compatible token verification (jose) — used in middleware
  auth-shared.ts  # Shared validation (validatePassword) — import from here, not inline
  constants.ts    # API_ROUTES, PAGE_ROUTES, UI_TEXT, fetchWithTimeout
  csrf.ts         # HMAC-signed double-submit CSRF tokens
  database.ts     # Drizzle db instance (neon-http driver)
  permissions.ts  # Permission hierarchy + validateRouteAccess, getMostRestrictiveRole
  rate-limit.ts   # In-memory rate limiting per IP
  config/         # security.ts with SECURITY_CONFIG (bcrypt rounds, etc.)
context/
  AuthContext.tsx # Client-side auth state + token refresh logic
hooks/            # Data-fetching hooks per domain (use-admin.ts, use-courses.ts, etc.)
__tests__/        # Jest tests: api/, components/, hooks/, lib/, integration/
```

### Authentication & Authorization Flow

1. **Login** (`/api/auth/login`): Validates credentials, returns JWT pair in httpOnly cookies (`accessToken`, `refreshToken`). Account lockout tracked in-memory (5 attempts / 15 min).
2. **Middleware** (`middleware.ts`): Verifies `accessToken` cookie on every protected request using `verifyAccessTokenEdge` (edge-compatible jose). Passes `x-user-id`, `x-company-id`, `x-user-permissions` as *request* headers to route handlers (never on responses).
3. **Route handlers** read those internal request headers to authorize actions without re-verifying the token.
4. **Client auth state** (`AuthContext.tsx`): Uses `credentials: "include"` fetch, never stores tokens in localStorage. Uses `useRef` (not `useState`) for the `isRefreshing` flag to prevent race conditions.

### Role & Permission System

Three system roles stored in the `roles` table with `permissions` (jsonb array):
- `admin` — platform-wide management
- `company` — company-scoped operations
- `student` — course enrollment/progress

Permissions are hierarchical strings (e.g., `"platform:admin"` implies `"platform:write"` and `"platform:read"`). See `lib/permissions.ts` for `PERMISSION_HIERARCHY`. Route access is validated in middleware via `validateRouteAccess()` and `getMostRestrictiveRole()`.

### Database Schema Key Tables

| Table | Purpose |
|---|---|
| `users` | User accounts with optional passwordHash (null for social login) |
| `user_companies` | Many-to-many users ↔ companies with roleId |
| `roles` | RBAC roles with permissions jsonb array |
| `courses` | Courses with AI-generated content, visibility controls |
| `enroll_course` | Student course enrollments with progress tracking |
| `certificates` | Issued completion certificates |
| `subscriptions` | Company Stripe subscriptions |
| `invitation_tokens` | Email invite tokens |

### CSRF Protection

Stateless HMAC-signed tokens (`timestamp:random:signature`). Token sent in `csrf_token` cookie and `x-csrf-token` header (double-submit pattern). Exempt routes: login, register, refresh, forgot-password, verify-email. All other mutations must include the CSRF header. Use `use-csrf-token` hook client-side.

### Critical Patterns

- **Password validation**: Always use `validatePassword()` from `lib/auth-shared.ts` — never inline validation.
- **Drizzle `and()` with undefined**: Passing `undefined` to `and()` silently drops the condition. Always ensure all conditions are defined before passing to query predicates.
- **Pagination bounds**: Cap with `Math.min(100, Math.max(1, limit))`.
- **`fetchWithTimeout`**: Use this (from `lib/constants.ts`) for all client-side API calls instead of bare `fetch`.
- **Server-only code**: `lib/auth.ts` and `lib/database.ts` include `import "server-only"` — do not import in client components or middleware.

### Environment Variables

Required for local dev (copy from env.test.example or run `node scripts/setup-env.js`):
```
DATABASE_URL        # Neon PostgreSQL connection string
JWT_SECRET          # Min 32 chars
REFRESH_TOKEN_SECRET
CSRF_SECRET         # Falls back to JWT_SECRET if unset
COOKIE_SECRET
```
