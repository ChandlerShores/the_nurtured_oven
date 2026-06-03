# Environment variables — Production vs Preview

Vercel lets you use **different values per deployment tier**. This project expects:

| Tier | Vercel checkbox | Square | Typical URL |
|------|-----------------|--------|-------------|
| **Production** | Production | `SQUARE_ENVIRONMENT=production` + production token/location | `https://thenurturedoven.com` |
| **Preview** | Preview | `SQUARE_ENVIRONMENT=sandbox` + sandbox token/location | `https://*.vercel.app` (auto) |
| **Local** | `.env.local` | sandbox | `http://localhost:3000` |

Template files (copy values into Vercel — do not commit secrets):

- [`.env.production.example`](../.env.production.example) → Production only
- [`.env.preview.example`](../.env.preview.example) → Preview only
- [`.env.development.example`](../.env.development.example) → local `.env.local`

## Vercel setup

1. **Project → Settings → Environment Variables**
2. Add each variable and select which environments apply:
   - Production-only vars → check **Production**
   - Preview-only vars → check **Preview**
   - Shared (e.g. `RESEND_API_KEY`, `OWNER_EMAIL`) → check **Production** and **Preview** (and Development if you use `vercel dev`)
3. **Redeploy** after changes (especially `NEXT_PUBLIC_*`).

## `NEXT_PUBLIC_APP_URL`

- **Production:** `https://thenurturedoven.com` (required for stable checkout redirect + webhook).
- **Preview:** can be **unset** — server code falls back to `https://${VERCEL_URL}` for each deploy.
- **Local:** `http://localhost:3000`

## Square webhooks (two subscriptions)

| Square dashboard mode | Notification URL |
|----------------------|------------------|
| **Production** app | `https://thenurturedoven.com/api/webhooks/square` |
| **Sandbox** app | Your preview URL + `/api/webhooks/square`, or ngrok for localhost |

Each subscription needs its own **signature key** and matching `SQUARE_WEBHOOK_NOTIFICATION_URL` in that Vercel environment.

Event: **`payment.updated`** only.

## Admin dashboard (`/admin`)

Set in Production (and Preview if you test admin on branch deploys):

- `ADMIN_PASSWORD` — single shared password for `/admin/login`. Stored only on the server (Vercel env). Never use `NEXT_PUBLIC_` for this value.

The admin session uses an **httpOnly** cookie (`tno_admin_session`). Google Sheets credentials (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`) are used only in server routes and API handlers — never sent to the browser.

## Google Sheets export (paid orders + weekly menu)

Set these variables in any environment where you want automatic row inserts after paid Square webhooks, or live menu data from the **Menu** tab:

- `GOOGLE_SHEET_ID` (required) — e.g. `1gBJMFJk0KGRdbnFrdBrQP1iZE0yjdlHwIrLOh5sFgLg`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` (required)
- `GOOGLE_PRIVATE_KEY` (required)
- `GOOGLE_SHEETS_ORDERS_RANGE` (optional, default `Orders!A:R`)
- `GOOGLE_SHEETS_LINE_ITEMS_RANGE` (optional, default `Order Line Items!A:M`)
- `GOOGLE_SHEETS_MENU_RANGE` (optional, default `Menu!A:L`)
- `GOOGLE_SHEETS_RANGE` (legacy alias for orders range only)

### Menu tab (read-only)

The site loads weekly products from the **Menu** tab. Header row (columns A–L):

`slug`, `name`, `description`, `price`, `active`, `featured`, `category`, `sort_order`, `image_slug`, `image_url`, `allergens`, `notes`

Only rows with `active` = TRUE are shown. Rows are sorted by `sort_order`. If the sheet is unavailable, the hardcoded fallback in `lib/content/currentMenu.ts` is used.

Admin menu photo uploads:

- **Local dev:** files save to `public/images/menu/{slug}.jpg` (or `.png` / `.webp`).
- **Vercel:** set `BLOB_READ_WRITE_TOKEN` (Vercel Dashboard → Storage → Blob) so uploads use public Blob URLs. Without it, use the image URL field or commit files under `public/images/menu/`.

Service account requirements:

1. Enable Google Sheets API in your Google Cloud project.
2. Create a service account key JSON.
3. Share the target sheet with the service account email as **Editor**.
4. Copy values from the JSON into env vars:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`

## Weekly ordering window

| Variable | Default | Effect |
|----------|---------|--------|
| `WEEKLY_ORDERING_DISABLED` | off | Set to `true`, `1`, or `yes` to **always** close weekly ordering and checkout (any environment, including Production). |
| `ORDERING_TEST_WEEKDAY` | — | **Local `pnpm dev` only** (`NODE_ENV=development`). Fakes the clock; ignored on Vercel. |

When `WEEKLY_ORDERING_DISABLED` is not set, the site uses the real schedule in `lib/menu/schedule.ts` (America/New_York).

## Common mistakes

- Putting Application ID (`sq0idp-...`) in `SQUARE_LOCATION_ID` → use Location ID (`LX5V0NV78YEX5` style).
- Production token with `SQUARE_ENVIRONMENT=sandbox` (or the reverse).
- Webhook URL in Square does not **exactly** match `SQUARE_WEBHOOK_NOTIFICATION_URL`.

## Check deployment tier (local)

```bash
pnpm env:check
```
