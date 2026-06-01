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

## Ports

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:5173     |
| Backend  | http://localhost:3000     |
| MongoDB  | localhost:27017           |

## First run

```bash
# 1. Copy env file
cp .env.example .env

# 2. Start the full stack (first run builds images)
docker compose up --build

# 3. Register the first user — no seeding required
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","organizationName":"Acme Corp"}'
```

The response contains `access_token`. Use it as `Authorization: Bearer <token>` on all protected routes.

## API

| Method | Path              | Auth | Description                               |
|--------|-------------------|------|-------------------------------------------|
| POST   | /auth/register    | —    | Create org + admin user, return JWT        |
| POST   | /auth/login       | —    | Return JWT                                |
| GET    | /auth/me          | JWT  | Current user profile                      |
| GET    | /users            | JWT  | List users in your org                    |
| GET    | /users/:id        | JWT  | Get user by id                            |
| PATCH  | /users/:id        | JWT  | Update user                               |
| DELETE | /users/:id        | JWT  | Delete user                               |
| GET    | /organizations    | JWT  | List active orgs                          |
| GET    | /preferences      | JWT  | Get your preferences                      |
| PUT    | /preferences      | JWT  | Upsert your preferences                   |

## Development (without Docker)

```bash
pnpm install
# start api (separate terminal)
cd apps/api && pnpm dev
# start web (separate terminal)
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
