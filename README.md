# User Management & Preferences

Multi-tenant SaaS app — Turborepo monorepo with NestJS API, React frontend, and MongoDB.

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Monorepo | Turborepo + pnpm workspaces         |
| Backend  | NestJS 10 (TypeScript), Mongoose    |
| Frontend | React 18 + Vite (TypeScript)        |
| Database | MongoDB 7                           |
| Runtime  | Docker Compose                      |

## Quick start

```bash
# 1. Copy env file (edit values if needed — defaults work out of the box)
cp .env.example .env

# 2. Start the full stack (builds images on first run)
docker compose up --build
```

The frontend is reachable at **http://localhost:5173**.  
The API runs at **http://localhost:3000**.

No seeding step is required. Open the frontend, click **Register**, and the first user is created.

## Registration and login — end to end

**Registration**

1. User submits the registration form: `firstName`, `lastName`, `email`, `organizationName`, `password`.
2. The API creates a new Organization document, then creates a User with `role: "admin"` linked to that organization.
3. A signed JWT is issued and placed in an httpOnly cookie (`token`). The response body also returns the token and user profile, but the frontend uses the cookie for subsequent requests.
4. The browser is redirected to the members page.

**Login**

1. User submits `email` + `password`.
2. The API looks up the user by email, verifies the password with bcrypt, and issues a new JWT cookie.
3. The browser is redirected to the members page.

**Session persistence**

The cookie has a 7-day `maxAge` and is sent automatically on every request (`credentials: "include"`). Refreshing the page re-validates the session via `GET /auth/me`.

**Logout**

`POST /auth/logout` clears the cookie server-side. The frontend also flushes the React Query cache and redirects to `/login`.

## Auth strategy

**JWT in an httpOnly cookie.**

The token is set by the server with `httpOnly: true`, `sameSite: "lax"`, and `secure: true` in production. The frontend never reads or stores the token — it is sent automatically by the browser on every same-site request.

Chosen over `localStorage`/Bearer header to prevent XSS token theft (JS cannot access the cookie).

**Where it is enforced:**

- Every protected backend route uses `@UseGuards(JwtAuthGuard)` (NestJS Passport guard using `passport-jwt`, configured to extract the token from cookies).
- The JWT payload embeds `userId`, `email`, `organizationId`, and `role`. Controllers read `organizationId` and `role` from `req.user` (the decoded token), never from the request body or URL.
- Admin-only endpoints additionally use `@UseGuards(RolesGuard)` + `@Roles('admin')`, which returns 403 if the token's role is not `admin`.
- The frontend wraps all authenticated pages in a `ProtectedRoute` component that calls `GET /auth/me`; unauthenticated users are redirected to `/login`.

## Roles

| Role     | Can do                                                                 |
|----------|------------------------------------------------------------------------|
| `admin`  | View org member list · Add new users · Edit own preferences            |
| `member` | View org member list · Edit own preferences                            |

- Every registered user becomes `admin` of their own organization.
- Users added by an admin default to `member`. The add-user form includes an optional role dropdown so the admin can promote to `admin` at creation time.
- Admins edit their own preferences the same way members do.

## Public vs protected routes

**Backend**

| Route                  | Guard                        |
|------------------------|------------------------------|
| `POST /auth/register`  | None                         |
| `POST /auth/login`     | None                         |
| `POST /auth/logout`    | None                         |
| All other routes       | `JwtAuthGuard` (401 if missing/invalid token) |
| `POST /users`          | `JwtAuthGuard` + `RolesGuard` (403 if not admin) |

**Frontend**

| Path          | Access                                          |
|---------------|-------------------------------------------------|
| `/login`      | Public — redirects to `/members` if already authenticated |
| `/register`   | Public — redirects to `/members` if already authenticated |
| `/members`    | Protected — redirects to `/login` if not authenticated   |
| `/preferences`| Protected — redirects to `/login` if not authenticated   |

The add-user form on the members page is conditionally rendered only when `role === "admin"` (derived from `GET /auth/me`). The server enforces the same check independently.

## API

### Auth

**`POST /auth/register`**
```
Request  { email, password, firstName, lastName, organizationName }
Response 201 { access_token, user: { _id, email, firstName, lastName, role, organizationId } }
         409 { message: "Email already in use" }
         400 validation errors
```
Also sets httpOnly cookie `token`.

**`POST /auth/login`**
```
Request  { email, password }
Response 200 { access_token, user: { _id, email, firstName, lastName, role, organizationId } }
         401 { message: "Invalid credentials" }
```
Also sets httpOnly cookie `token`.

**`POST /auth/logout`**
```
Response 200 { message: "Logged out" }
```
Clears the `token` cookie.

**`GET /auth/me`**
```
Response 200 { _id, email, firstName, lastName, role, organizationId: { _id, name }, isActive }
         401 if unauthenticated
```

### Users

**`GET /users`** — JWT required
```
Response 200 [ { _id, email, firstName, lastName, role, organizationId, isActive, createdAt } ]
```
Returns only users belonging to the authenticated user's organization (scoped via token).

**`POST /users`** — JWT + admin role required
```
Request  { email, password, firstName, lastName, role?: "admin" | "member" }
Response 201 { _id, email, firstName, lastName, role, organizationId, isActive }
         403 if requester is not admin
         409 if email already exists
         400 validation errors
```
`organizationId` is taken from the JWT — it cannot be supplied in the body.

### Preferences

**`GET /preferences`** — JWT required
```
Response 200 {
  _id, userId, organizationId, theme,
  tablePreferences: { visibleColumns: string[], defaultSort: string },
  updatedAt
}
```
Creates a document with defaults (`theme: "light"`, all columns visible, sorted by `firstName`) if none exists yet.

**`PUT /preferences`** — JWT required
```
Request  {
  theme?: "light" | "dark",
  tablePreferences?: {
    visibleColumns: Array<"firstName" | "lastName" | "email" | "role">,
    defaultSort: "firstName" | "lastName" | "email"
  }
}
Response 200  updated preferences object (same shape as GET)
         422  { message, errors: [{ field, message }] }  on validation failure
```
The server normalises the stored value (rejects unknown enum keys). The frontend always syncs to the server response after a successful save — the server is the source of truth.

## Data model

**Organization**
```
_id           ObjectId
name          String  (required)
isActive      Boolean (default true)
createdAt / updatedAt
```

**User**
```
_id           ObjectId
email         String  (required, unique, lowercase)
passwordHash  String  (required, not returned in queries)
firstName     String
lastName      String
role          "admin" | "member"  (default "member")
organizationId  ObjectId → Organization  (required, indexed)
isActive      Boolean (default true)
createdAt / updatedAt
```
Email is the global unique identifier. The data model uses a generated `_id`; email is the login credential, not the primary key.

**Preference**
```
_id             ObjectId
userId          ObjectId → User  (required, unique)
organizationId  ObjectId → Organization  (required)
theme           "light" | "dark"  (default "light")
tablePreferences: {
  visibleColumns  String[]  (subset of ["firstName","lastName","email","role"])
  defaultSort     "firstName" | "lastName" | "email"  (default "firstName")
}
createdAt / updatedAt
```
One preference document per user (`userId` is unique). Upserted on every `PUT /preferences` call.

## Running tests

**Backend (Jest)**
```bash
cd apps/api
pnpm test
```
Covers `PreferencesController`: authenticated GET/PUT (happy path) and unauthenticated requests (401 negative cases).

**Frontend (Vitest + React Testing Library)**
```bash
cd apps/web
pnpm test
```
Covers `PreferencesPage`: save flow, reset flow, dirty state indicator, Save button disabled when pristine, and theme class applied to `<html>`.

## Development without Docker

```bash
pnpm install

# Terminal 1 — API (requires a running MongoDB on localhost:27017)
cd apps/api && pnpm dev

# Terminal 2 — Frontend
cd apps/web && pnpm dev
```

## Monorepo structure

```
apps/
  api/       NestJS backend
  web/       React + Vite frontend
packages/
  typescript-config/   Shared tsconfig base files
```

## Shortcuts and known gaps

- `GET /users/:id`, `PATCH /users/:id`, and `DELETE /users/:id` are scaffolded in the controller and service but are not used by the frontend and are not tested. They were left in to show the service layer but should be considered incomplete.
- With more time: add pagination/search to the user list, broaden test coverage (service layer unit tests, more controller cases, one Playwright E2E flow), add optimistic UI for the preferences save with rollback on error, and tighten the unused user endpoints or remove them.
