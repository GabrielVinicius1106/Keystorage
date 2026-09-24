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
npm run build          # docker compose build
npm run build:uncached # docker compose build --no-cache
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
npm start        # next start (the Docker image runs the standalone `node server.js` instead)
```

There is no test suite and no linter configured. `server`'s `test` script is a placeholder `echo`.

## Environment

Each workspace has its own gitignored `.env`, validated at import time by a Zod schema that throws `InvalidEnvironmentVariables` on failure (`server/src/env/index.ts`, `app/app/env/index.ts`). There is no dev/prod branching in code: each variable holds a single value, and the environment decides it.

- `server/.env`: `NODE_ENV`, `HOSTNAME`, `PORT` (coerced to number), `ORIGIN_URL` (CORS origin)
- `app/.env`: `NODE_ENV`, `HOSTNAME`, `PORT` (coerced to number), `API_URL` (base URL of the Fastify API)

The `.env` files are for local dev only (`localhost` URLs, `127.0.0.1` host) and are excluded from images by each package's `.dockerignore`. In Docker the same variables come from `ENV` in each `dockerfile` and the `environment` block in `compose.yml` (`HOSTNAME=0.0.0.0`, `API_URL=http://server:5000`). Adding a variable means updating the `.env`, the Zod schema, the `dockerfile` and `compose.yml`. In `compose.yml` list syntax (`- KEY=value`), don't quote values: the quotes become part of the value.

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

The browser never talks to the Fastify API directly. Every call goes through the Next server, which forwards it to `env.API_URL`.

Server Component page `app/page.tsx` fetches all records via the `"use server"` helper `lib/data_fetching.ts` (`getAllKeyValues`, `deleteKeyValue`). The page calls `await connection()` (from `next/server`) before fetching, which makes it render dynamically on each request. Without that call, `next build` would pre-render the page statically and run the fetch at build time. The API isn't reachable then: in a Docker build the `server` hostname fails with `getaddrinfo EAI_AGAIN`, and because `getAllKeyValues` catches the error, the build would still succeed with an empty list baked into the page. Keep any page that reads from the API dynamic.

`app/api/keys/route.ts` is a Next route handler that proxies to the API: `POST` re-validates the body with `setKeyValueSchema` and forwards it, and `GET` forwards the list. `lib/revalidate_path.ts` exposes a `refresh(path)` server action; client components call `refresh('/')` after mutations and when a TTL hits zero to re-pull data.

- `components/Form.tsx` — client form, validates with `lib/schemas/setKeyValueSchema.ts` (mirrors the server schema) before POSTing to the relative `/api/keys`, which is the Next route handler above, not Fastify.
- `components/KeyValuesList.tsx` — renders a table above `MIN_WIDTH = 700` and a card list below it, using the `getWindowWidth` client hook (`lib/getWindowWidth.ts`) rather than CSS breakpoints.
- `components/TimeToLive.tsx` — 1s `setInterval` countdown from the `time_to_live` value; triggers `refresh('/')` on expiry.

UI is shadcn (`components.json`: style `base-maia`, base color `taupe`, RSC, icon library hugeicons) on Tailwind CSS v4 via `@tailwindcss/postcss`; generated primitives live in `components/ui/` and are usually not hand-edited. Path alias `@/*` maps to `app/*` (the workspace root, not `app/app/`).

## Docker

`compose.yml` builds both services from their per-package `dockerfile` (multi-stage node:24-alpine, `npm ci` + build, then runner). Container names are `keystorage_api` and `keystorage_app`. `app` depends on `server`, and both use `restart: always`. On the compose network the API is `http://server:5000`. That name only resolves between running containers, never during `docker compose build`.

- `server/dockerfile`: the runner reinstalls production deps (`npm install --omit=dev`), copies `build/`, and runs `npm run start`.
- `app/dockerfile`: `next.config.ts` sets `output: 'standalone'`. The runner copies only `.next/standalone` (to `./`) and `.next/static`, then runs `node server.js`. The standalone server reads `HOSTNAME`/`PORT` to bind. There is no `public/` dir. If you add one, copy it into the runner too.
