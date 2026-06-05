# The Nurtured Oven

Next.js 14 bakery site for weekly preorder sales, Square checkout, gift/general inquiries, and a password-protected admin portal for orders, deliveries, menu editing, customer emails, and financials.

The app uses Google Sheets as the system of record, Square for payment, Resend for email, and Redis for production-grade idempotency/rate limiting. There is no database in this repo.

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Local app: `http://localhost:3000`

Check environment loading:

```bash
pnpm env:check
```

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start local dev server |
| `pnpm build` | Build production bundle |
| `pnpm start` | Start built production server |
| `pnpm lint` | Run Next.js ESLint |
| `pnpm typecheck` | Run `tsc --noEmit` |
| `pnpm test:unit` | Run Node unit tests |
| `pnpm test:e2e` | Run all Playwright tests |
| `pnpm test:e2e:admin` | Run admin smoke tests |
| `pnpm env:check` | Print masked env diagnostics |
| `pnpm sheets:seed-month` | Seed sample order rows in Sheets |
| `pnpm sheets:seed-financials` | Seed Product Costs and Weekly Expenses tabs |
| `pnpm sheets:append-menu` | Append one Menu row |
| `pnpm email:preview` | Preview transactional email HTML |
| `pnpm screenshots` | Full-page PNGs into `SCREENSHOTS/` |

On OneDrive, if `pnpm build` fails with an `.next` `EINVAL readlink` error, delete `.next` and rebuild.

## Project Structure

```text
app/
  api/checkout/           Weekly order to Square checkout
  api/inquiry/            Gift, reminder, and general inquiries
  api/webhooks/square/    Square paid-order webhook
  api/admin/              Authenticated admin APIs
  admin/                  Admin login and portal pages
components/               UI by area
lib/
  admin/                  Admin auth, stats, validation, operations
  content/                Site content and menu fallback
  email/                  Resend templates and send helpers
  google-sheets/          Sheets readers/writers
  menu/                   Weekly ordering schedule and copy
  order/                  Catalog, fulfillment, delivery fee logic
  security/               Input, rate limit, external URL helpers
  square/                 Checkout, webhook, order matching, Redis store
docs/                     Maintainer and operator documentation
middleware.ts             Admin session guard
public/images/            Product, brand, and menu images
scripts/                  Env checks, seed scripts, previews, exports
tests/                    Playwright tests
```

## Menu Source Of Truth

The public weekly menu is loaded from the Google Sheets `Menu` tab through `getCurrentMenu()` in `lib/content/load-menu.ts`.

Normal updates should happen in `/admin/menu`. Admin saves write to Sheets and revalidate the public menu cache. If Sheets is unavailable or has no active rows, the app falls back to `lib/content/currentMenu.ts`.

Checkout prices come from the same server-side catalog built from the current menu data. Client totals are display-only.

## Admin Portal

- Production URL: `/admin`
- Login page: `/admin/login`
- Requires `ADMIN_PASSWORD`
- Strongly recommended: `ADMIN_SESSION_SECRET`

The admin portal manages weekly orders, status updates, customer emails, deliveries, menu rows/images, financial costs, weekly expenses, and admin notes.

## Documentation

| Doc | Purpose |
|---|---|
| [docs/README.md](./docs/README.md) | Documentation index |
| [docs/ENV.md](./docs/ENV.md) | Environment variables and Sheets tab setup |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Vercel deployment and promotion checklist |
| [docs/ADMIN_SOP.md](./docs/ADMIN_SOP.md) | Baker/admin operating procedures |
| [docs/PAYMENTS.md](./docs/PAYMENTS.md) | Square checkout, webhook, Sheets, and email flow |
| [docs/SECURITY.md](./docs/SECURITY.md) | Auth, rate limits, webhook verification, and known limits |
| [docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md) | Accessibility checklist and conventions |

Historical implementation notes and old reviews belong in `docs/archive/`, not in the active docs index.
