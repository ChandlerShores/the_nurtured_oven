# Deployment

Audience: deployment maintainers.

The production app is intended to run on Vercel with Square production credentials, Google Sheets, Redis, Resend, and optional Vercel Blob storage for admin menu image uploads.

## Branch And Tier Model

| Branch / Target | Vercel Tier | Square Mode | Purpose |
|---|---|---|---|
| `preview` or PR branch | Preview | Sandbox | Test site changes and sandbox payments |
| `main` | Production | Production | Live customer site |
| Local machine | Development | Sandbox | Development and local smoke tests |

Preview deployments should not use Square production credentials unless explicitly intended.

## Before First Production Deploy

1. Set all production env vars from `.env.production.example`.
2. Confirm `NEXT_PUBLIC_APP_URL=https://thenurturedoven.com`.
3. Configure Square production webhook to `https://thenurturedoven.com/api/webhooks/square`.
4. Set `REDIS_URL`; production should not run without Redis.
5. Share the Google Sheet with the service account as Editor.
6. Verify Resend sender domain and owner inbox.
7. Enable Vercel Blob and set `BLOB_READ_WRITE_TOKEN` if admin image uploads are needed on Vercel.
8. Consider Vercel Deployment Protection for Preview, especially if `ADMIN_PASSWORD` is set there.

## Preflight Checks

Run locally before pushing or promoting:

```bash
pnpm env:check
pnpm typecheck
pnpm test:unit
pnpm test:e2e:admin
pnpm build
```

If changing customer-facing checkout, also run a sandbox checkout/webhook smoke test. See [PAYMENTS.md](./PAYMENTS.md).

## Vercel Env Checklist

Production:

- `SQUARE_ENVIRONMENT=production`
- Production Square token and location ID
- Production webhook signature key and notification URL
- `NEXT_PUBLIC_APP_URL=https://thenurturedoven.com`
- `REDIS_URL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- Google Sheets credentials
- Resend email settings

Preview:

- `SQUARE_ENVIRONMENT=sandbox`
- Sandbox Square token and location ID
- Sandbox webhook settings if testing payment webhooks
- Optional admin password
- Optional Redis
- Optional Google Sheets credentials

Full variable list: [ENV.md](./ENV.md).

## Promotion Checklist

1. Confirm the target branch and Vercel deployment tier.
2. Confirm `pnpm env:check` reports the expected tier and Square mode.
3. Confirm `COMING_SOON_MODE` is unset/false for live ordering, or `true` for launch mode.
4. Confirm `/menu` shows the intended current menu.
5. Confirm `/contact?intent=weekly-order` can start checkout when ordering is open.
6. Confirm `/admin/login` accepts the production admin password.
7. Confirm `/admin/orders`, `/admin/menu`, and `/admin/financials` load from Sheets.
8. Confirm Square webhook delivery after a test payment.
9. Confirm owner/customer paid-order emails.

## Rollback

Use Vercel rollback for application code regressions.

For operational configuration mistakes:

- Wrong Square mode/token: fix env vars and redeploy.
- Wrong webhook URL/signature key: fix Square dashboard and Vercel env to match.
- Broken menu data: fix the Google Sheets `Menu` tab or use the fallback menu only as a temporary emergency path.
- Admin lockout: verify `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, and Vercel deployment tier.

## Emergency Ordering Close

For pre-launch, use coming-soon mode:

```text
COMING_SOON_MODE=true
```

This keeps the public site polished and visible while blocking checkout.

Set this in the relevant Vercel environment:

```text
WEEKLY_ORDERING_DISABLED=true
```

Redeploy if needed. Remove it or set it false to return to schedule-based ordering.

## Post-Deploy Smoke

After production deploy:

1. Visit `/`.
2. Visit `/menu`.
3. Visit `/contact`.
4. Visit `/order/success`.
5. Login to `/admin`.
6. Open Orders, Production, Deliveries, Menu, Financials.
7. Check Vercel logs for webhook, Sheets, or email errors.

For payment-affecting changes, place a small real order and verify the full Square to Sheets to email flow.
