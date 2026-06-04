# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 14 App Router project for The Nurtured Oven. Public pages and API routes live in `app/`, with admin portal pages under `app/admin/` and authenticated APIs under `app/api/admin/`. UI components are grouped by feature in `components/`. Shared business logic lives in `lib/`, including `lib/square/`, `lib/google-sheets/`, `lib/admin/`, `lib/order/`, and `lib/security/`. Playwright tests live in `tests/`; unit tests sit beside source files as `*.test.ts`. Static images are in `public/images/`. Maintained documentation is in `docs/`; historical notes belong in `docs/archive/`.

## Build, Test, and Development Commands

- `pnpm dev`: run the local dev server at `http://localhost:3000`.
- `pnpm build`: build the production bundle.
- `pnpm start`: serve the built app.
- `pnpm lint`: run Next.js ESLint.
- `pnpm typecheck`: run `tsc --noEmit`.
- `pnpm test:unit`: run Node unit tests in `lib/**/*.test.ts` and `lib/email/**/*.test.ts`.
- `pnpm test:e2e`: run all Playwright tests.
- `pnpm test:e2e:admin`: run admin smoke tests only.
- `pnpm env:check`: print masked environment diagnostics.

## Coding Style & Naming Conventions

Use TypeScript, React Server Components by default, and client components only where interactivity requires `"use client"`. Prefer feature-specific helpers in `lib/` over duplicating route logic. Use PascalCase for React components, camelCase for functions/variables, and kebab-case for route folders and image filenames. Keep code formatted consistently with the existing two-space style and run `pnpm lint`/`pnpm typecheck` before shipping.

## Testing Guidelines

Use Node’s `tsx --test` runner for unit tests and Playwright for browser smoke tests. Name unit tests `*.test.ts` next to the module they cover. Add focused tests for payment, Sheets parsing, auth, rate limiting, and other shared business rules. For UI/admin workflow changes, run `pnpm test:e2e:admin`; for broad routing or checkout changes, run `pnpm test:e2e`.

## Commit & Pull Request Guidelines

Recent history uses short imperative subjects, for example: `Fix Square webhook build type errors.` Keep commits scoped and descriptive. PRs should include a concise summary, verification commands run, screenshots for visible UI changes, and notes for env/config changes. Link related issues when available.

## Security & Configuration Tips

Do not commit secrets, service account JSON, or `.env.local`. Production requires Redis for shared rate limits and Square webhook idempotency. Keep environment guidance in `docs/ENV.md`, deployment steps in `docs/DEPLOYMENT.md`, payment behavior in `docs/PAYMENTS.md`, and security notes in `docs/SECURITY.md`.
