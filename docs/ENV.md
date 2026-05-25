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
