# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Keystorage — an in-memory key/value store modeled on Redis (`SET`, `GET`, `TTL`), built as a learning exercise, not a production application. Data lives only in a `Map` inside the API process and is lost on restart.

npm workspaces monorepo with two packages:

- `app/` — `keystorage-app`, Next.js 16 (App Router, React 19, React Compiler enabled) frontend on port 3000
- `server/` — `keystorage-api`, Fastify 5 + TypeScript API on port 5000

UI text and most comments are in Portuguese (pt-BR); keep new user-facing strings in Portuguese.

## Commands

Run from the repo root:

```bash
npm install            # installs both workspaces
npm run app            # dev: concurrently runs API (tsx --watch) + Next dev server
npm run build          # docker compose build --no-cache
npm run build:cached   # docker compose build
npm start              # docker compose up
npm run start:detached # docker compose up -d
```

Per workspace:

```bash
# server/
npm run server   # tsx --watch ./src/server.ts
npm run build    # tsc -> ./build
npm start        # node ./build/server.js

# app/
npm run app      # next dev
npm run build    # next build
npm start        # next start
```

There is no test suite and no linter configured. `server`'s `test` script is a placeholder `echo`.

## Environment

Each workspace has its own gitignored `.env`, validated at import time by a Zod schema that throws `InvalidEnvironmentVariables` on failure (`server/src/env/index.ts`, `app/app/env/index.ts`). Adding a variable means updating both the `.env` and its schema.

- `server/.env`: `NODE_ENV`, `HOST`, `DOCKER_HOST`, `PORT`, `DEV_ORIGIN`, `DOCKER_ORIGIN`
- `app/.env`: `NODE_ENV`, `DEV_HOST`, `PRODUCTION_HOST`, `DEV_API_URL`, `PRODUCTION_API_URL`

Dev vs. Docker selection is done inline with `env.NODE_ENV === 'development' ? env.DEV_* : env.DOCKER_*/PRODUCTION_*`. Under Docker Compose, the API is reachable at `http://server:5000` on the compose network. Note `compose.yml` injects `HOST`/`PORT`/`ORIGIN` directly, which does not match the server's env schema (`DOCKER_HOST`, `DEV_ORIGIN`, `DOCKER_ORIGIN`) — a known rough edge.

## Architecture

### server/

`src/server.ts` wires everything: `@fastify/cors` (origin from env, methods GET/POST/DELETE), `@fastify/rate-limit` (max 10000 / 60), an `onRequest` logging hook, a global error handler, a 404 handler, and `applicationRoutes`.

`src/lib/keystorage.ts` is the store: a singleton `k_storage` instance of a `Keystorage` class implementing `SET / GET / DEL / EXISTS / TTL / GET_ALL` over a private `Map<string, KeystorageObject>`. Expiry is **lazy** — nothing sweeps the map; `GET` and `GET_ALL` skip entries whose `expires_at` has passed, and `time_to_live` is recomputed per read.

Route handlers (`src/routes/applicationRoutes.ts`) validate with `safeParse` against `src/schemas/schemas.ts` and `throw new InvalidRequestBodyError(parsed.error)` on failure; the global error handler renders it. `InvalidRequestBodyError` formats the message via `z.prettifyError`.

Because `tsconfig.json` uses `module: nodenext`, **relative imports must carry the `.js` extension** (e.g. `from "./lib/keystorage.js"`) even though the sources are `.ts`.

Every response is an object with `code`, `status`, and a payload field. Error codes: `HANDLER_NOT_FOUND` (404), `LIMIT_REQUESTS_EXCEEDED_ERROR` (429, includes `wait`), `ZOD_ERROR` (400, includes `issues`), `INVALID_REQUEST_BODY_ERROR` (400).

### API routes

| Method | Path | Body / Params | Success |
| --- | --- | --- | --- |
| GET | `/api` | — | `APPLICATION_RUNNING`, 200 |
| POST | `/api/keys` | `{ key: string, value: string \| number \| boolean, expires_in: number (ms, positive) }` | `KEY_VALUE_CREATED` + `element`, 201 |
| GET | `/api/keys` | — | `GET_KEY_VALUES` + `elements[]`, 200 |
| GET | `/api/keys/:key` | `key` | `GET_KEY_VALUE` + `element` (`{}` if missing/expired), 200 |
| DELETE | `/api/keys/:key` | `key` | `KEY_VALUE_DELETED`, 200 |

`element` shape: `{ key, value, created_at, expires_at, time_to_live }`.

### app/

Server Component page `app/page.tsx` fetches all records via the `"use server"` helper `lib/data_fetching.ts` (`getAllKeyValues`, `deleteKeyValue`), which calls the API using the env-selected base URL. `lib/revalidate_path.ts` exposes a `refresh(path)` server action; client components call `refresh('/')` after mutations and when a TTL hits zero to re-pull data.

- `components/Form.tsx` — client form, validates with `lib/schemas/setKeyValueSchema.ts` (mirrors the server schema) before POSTing.
- `components/KeyValuesList.tsx` — renders a table above `MIN_WIDTH = 700` and a card list below it, using the `getWindowWidth` client hook (`lib/getWindowWidth.ts`) rather than CSS breakpoints.
- `components/TimeToLive.tsx` — 1s `setInterval` countdown from the `time_to_live` value; triggers `refresh('/')` on expiry.

UI is shadcn (`components.json`: style `base-maia`, base color `taupe`, RSC, icon library hugeicons) on Tailwind CSS v4 via `@tailwindcss/postcss`; generated primitives live in `components/ui/` and are usually not hand-edited. Path alias `@/*` maps to `app/*` (the workspace root, not `app/app/`).

Known rough edge: `Form.tsx` POSTs to the relative path `/api/keys`, which hits the Next server rather than the Fastify API — unlike the other calls, which go through `lib/data_fetching.ts`.

## Docker

`compose.yml` builds both services from their per-package `dockerfile` (multi-stage node:24-alpine, build then runner). `app` depends on `server`; both `restart: unless-stopped`.
