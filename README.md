# Keystorage

An in-memory key/value store with time-to-live, modeled on Redis (`SET`, `GET`, `TTL`), with a REST API and a web client.

> **This is a learning exercise, not a production application.** All data lives in a `Map` inside the API process and is lost when the server restarts. There is no authentication and no persistence.

## Overview

The project is an npm workspaces monorepo with two packages:

| Package | Directory | Stack | Port |
| --- | --- | --- | --- |
| `keystorage-api` | `server/` | Node.js + Fastify 5 + TypeScript | 5000 |
| `keystorage-app` | `app/` | Next.js 16 (App Router) + React 19 | 3000 |

The API keeps records in memory and expires them lazily — nothing sweeps the store, entries whose `expires_at` has passed are simply skipped on read. The web client lists every live record, shows a live countdown for each one, and refreshes the list when a record expires.

## Technologies

**API**

- Node.js, TypeScript
- Fastify 5
- `@fastify/cors`, `@fastify/rate-limit`
- Zod — request body, route params and environment variable validation
- `tsx` for development, `tsc` for builds

**Web client**

- Next.js 16 (App Router, Server Components, Server Actions, React Compiler)
- React 19
- Tailwind CSS v4
- shadcn/ui, Hugeicons, Lucide
- Zod

**Infrastructure**

- Docker + Docker Compose (multi-stage `node:24-alpine` images)
- npm workspaces

## Getting started

Requirements: Node.js 22+ (24 recommended) and npm. Docker is optional.

```bash
git clone <repository-url>
cd Keystorage
npm install          # installs both workspaces
```

Create the two environment files described in [Environment variables](#environment-variables), then start both services:

```bash
npm run app          # runs the API and the web client together
```

- Web client: http://localhost:3000
- API health check: http://localhost:5000/api

### With Docker

```bash
npm run build        # docker compose build --no-cache
npm start            # docker compose up
```

## Scripts

Root:

| Script | Description |
| --- | --- |
| `npm run app` | Runs the API and the Next.js dev server concurrently |
| `npm run build` | `docker compose build --no-cache` |
| `npm run build:cached` | `docker compose build` |
| `npm start` | `docker compose up` |
| `npm run start:detached` | `docker compose up -d` |

`server/`:

| Script | Description |
| --- | --- |
| `npm run server` | Dev server with watch mode (`tsx --watch`) |
| `npm run build` | Compiles TypeScript to `build/` |
| `npm start` | Runs the compiled server |

`app/`:

| Script | Description |
| --- | --- |
| `npm run app` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serves the production build |

## Environment variables

Each package has its own `.env` file (both are gitignored). The values are validated with Zod at startup, and the process throws `Invalid Environment Variables.` if any are missing.

`server/.env`:

```env
NODE_ENV='development'

HOST='127.0.0.1'
DOCKER_HOST='0.0.0.0'

PORT=5000

DEV_ORIGIN='http://localhost:3000'
DOCKER_ORIGIN='http://app:3000'
```

`app/.env`:

```env
NODE_ENV='development'

DEV_HOST='127.0.0.1'
PRODUCTION_HOST='0.0.0.0'

DEV_API_URL='http://localhost:5000'
PRODUCTION_API_URL='http://server:5000'
```

`NODE_ENV` selects between the `DEV_*` and the `DOCKER_*` / `PRODUCTION_*` values, so the client reaches the API at `localhost:5000` locally and at `server:5000` on the Docker Compose network.

## API

Base URL: `http://localhost:5000`

Every response is a JSON object carrying a `code` and a `status`, plus a payload field. A record has the shape:

```jsonc
{
  "key": "apple",
  "value": 1.5,                              // string | number | boolean
  "created_at": "2026-09-17T12:00:00.000Z",
  "expires_at": "2026-09-17T12:01:00.000Z",
  "time_to_live": 60000                      // milliseconds remaining
}
```

### `GET /api` — health check

```jsonc
{
  "code": "APPLICATION_RUNNING",
  "message": "Hello from Keystorage API.",
  "status": 200
}
```

### `POST /api/keys` — create a record

Request body:

```jsonc
{
  "key": "apple",        // string
  "value": 1.5,          // string | number | boolean
  "expires_in": 60000    // positive number, milliseconds
}
```

Response — `201`:

```jsonc
{
  "code": "KEY_VALUE_CREATED",
  "element": { /* record */ },
  "status": 201
}
```

### `GET /api/keys` — list all live records

Response — `200`:

```jsonc
{
  "code": "GET_KEY_VALUES",
  "elements": [ /* records */ ],
  "status": 200
}
```

Expired records are omitted.

### `GET /api/keys/:key` — read one record

Response — `200`:

```jsonc
{
  "code": "GET_KEY_VALUE",
  "element": { /* record, or {} if missing or expired */ },
  "status": 200
}
```

### `DELETE /api/keys/:key` — delete a record

Response — `200`:

```jsonc
{
  "code": "KEY_VALUE_DELETED",
  "message": "Key Value Deleted Successfully!",
  "status": 200
}
```

### Errors

| Code | Status | When |
| --- | --- | --- |
| `INVALID_REQUEST_BODY_ERROR` | 400 | Body or route params failed schema validation |
| `ZOD_ERROR` | 400 | Validation error surfaced by Zod, includes `issues` |
| `HANDLER_NOT_FOUND` | 404 | Unknown route |
| `LIMIT_REQUESTS_EXCEEDED_ERROR` | 429 | Rate limit exceeded, includes `wait` in seconds |
| `INTERNAL_SERVER_ERROR` | 500 | Record could not be created |

Rate limiting is applied globally at 10000 requests per window.

## Project structure

```
.
├── app/                  # Next.js web client
│   ├── app/              # App Router pages, layout, env validation
│   ├── components/       # Form, KeyValuesList, TimeToLive, shadcn/ui primitives
│   └── lib/              # data fetching, server actions, schemas, types
├── server/               # Fastify API
│   └── src/
│       ├── lib/          # Keystorage class (the in-memory store)
│       ├── routes/       # route handlers
│       ├── schemas/      # Zod request schemas
│       ├── env/          # validated environment variables
│       └── errors/       # custom error classes
└── compose.yml           # Docker Compose definition for both services
```

The web client UI is written in Portuguese (pt-BR).

## License

The API package is published under the MIT license; the root package declares ISC.

## Author

Gabriel Vinícius da Cruz
