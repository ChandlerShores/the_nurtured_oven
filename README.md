# The Nurtured Oven

Next.js 14 bakery site — weekly preorder menu, Square checkout, gift inquiries, and a password-protected **admin portal** for orders, production, deliveries, menu editing, and financials.

**Data:** Google Sheets (orders, menu, financial tabs) + Square + optional Redis (webhook idempotency). There is **no database** in this repo.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # then fill in values (see docs/ENV.md)
pnpm dev                     # http://localhost:3000
```

Check loaded env: `pnpm env:check`

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Local dev server (`.env.local`) |
| `pnpm build` / `pnpm start` | Production bundle and server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test:unit` | Node unit tests (`lib/**/*.test.ts`) |
| `pnpm test:e2e:admin` | Playwright smoke tests for `/admin` auth |
| `pnpm env:check` | Print deployment tier and required vars |
| `pnpm sheets:seed-month` | Seed sample order rows in Sheets (dev) |
| `pnpm sheets:seed-financials` | Seed Product Costs / Weekly Expenses tabs |
| `pnpm sheets:append-menu` | Append one menu row (dev utility) |
| `pnpm email:preview` | Preview transactional email HTML locally |
| `pnpm playbook:export` | Export playbook content |

**Local build tip (OneDrive):** If `pnpm build` fails with `EINVAL readlink` on `.next`, delete the `.next` folder and rebuild.

## Project structure

```
app/
  (site)/                 # Public pages: menu, contact, gifts, FAQ, etc.
  admin/(portal)/         # Baker dashboard (orders, financials, menu, …)
  admin/login/            # Login page
  api/checkout/           # Weekly order → Square Payment Link
  api/inquiry/             # Gift / reminder / general inquiries
  api/webhooks/square/    # Paid-order webhook → Sheets + email
  api/admin/              # Authenticated admin APIs
components/               # UI by area (home, menu, order, contact, admin, …)
lib/
  content/                # Menu types, sheet loader, fallback currentMenu.ts
  google-sheets/          # Orders, menu, financials, customer email log
  menu/                   # Ordering window schedule (Eastern Time)
  order/                  # Catalog, delivery fee, weekly fulfillment
  square/                 # Checkout + payment webhook pipeline
  admin/                  # Auth, stats, production aggregates, API validation
  email/                  # Resend templates (paid order, inquiry, customer updates)
docs/                     # ENV, security, Square setup, engineering notes
middleware.ts             # Admin session guard for /admin and /api/admin
scripts/                  # Env check, sheet seeds, email preview
tests/                    # Playwright (admin portal)
public/images/            # Product and brand images
```

## Weekly menu

**Source of truth:** Google Sheets **Menu** tab, loaded by `getCurrentMenu()` in `lib/content/load-menu.ts` (cached tag `weekly-menu`).

| How to update | When |
|---------------|------|
| **Admin** → `/admin/menu` | Normal weekly edits (revalidates cache) |
| **Sheets** Menu tab directly | Bulk or offline edits |
| **`lib/content/currentMenu.ts`** | Fallback when Sheets is empty or unavailable; also supplies `menuCycleId` for Square metadata until sheet schema covers it |

Checkout catalog prices come from the same live menu data, not a separate file.

## Admin portal

- URL: `/admin` (login at `/admin/login`)
- Requires `ADMIN_PASSWORD` (12+ chars) and preferably `ADMIN_SESSION_SECRET` (32+ chars) — see `docs/ENV.md`
- Features: order board, status updates, customer emails, production list, deliveries, menu editor, financials (costs, expenses, charts), settings

Security overview: `docs/SECURITY.md`

## Environment

| Where | Template |
|-------|----------|
| Local | [`.env.example`](./.env.example) → `.env.local` |
| Vercel **Production** | [`.env.production.example`](./.env.production.example) |
| Vercel **Preview** | [`.env.preview.example`](./.env.preview.example) |

Full variable list and tier rules: **`docs/ENV.md`**. Square checklist: **`docs/SQUARE_SETUP_TODO.md`**.

**Branches:** `preview` for sandbox/Vercel preview deploys; `main` for production.

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/ADMIN_SOP.md](./docs/ADMIN_SOP.md) | Baker SOP for every admin portal area |
| [docs/ENV.md](./docs/ENV.md) | Environment variables by tier |
| [docs/SECURITY.md](./docs/SECURITY.md) | Threat model and production checklist |
| [docs/SQUARE_SETUP_TODO.md](./docs/SQUARE_SETUP_TODO.md) | Square apps, webhooks, checkout |
| [docs/COMPLETED_WORK.md](./docs/COMPLETED_WORK.md) | Recent engineering changelog |
| [docs/FULL_APPLICATION_REVIEW.md](./docs/FULL_APPLICATION_REVIEW.md) | Full-app review and prioritized follow-ups |
| [docs/the_nurtured_oven_business_model.md](./docs/the_nurtured_oven_business_model.md) | Business model reference |
