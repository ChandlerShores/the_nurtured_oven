# Security Overview

Audience: developers and security/deployment maintainers.

Threat model: a small bakery site with public ordering, Square webhooks, Google Sheets as the system of record, and a password-protected admin portal. This is not multi-tenant SaaS.

## Attack Surfaces

| Surface | Auth / Protection | Notes |
|---|---|---|
| `/admin`, `/api/admin/*` | Signed admin session cookie | Middleware guards admin pages and APIs. Per-route API checks remain in admin handlers. |
| `/api/checkout` | Public, rate-limited | Prices are server-side. Checkout redirects are allowlisted to Square HTTPS hosts. |
| `/api/inquiry` | Public, rate-limited | Public input is clamped and email HTML escapes user content. |
| `/api/webhooks/square` | Square HMAC signature | Rejects unsigned or mismatched payloads. |
| Google Sheets | Service account | Service account should have Editor access only to the required spreadsheet. |
| Square, Resend, Redis, Vercel Blob | Server env secrets | Never expose these as `NEXT_PUBLIC_*`. |

## Current Protections

- Admin login uses a shared password and signed `httpOnly`, `SameSite=Strict` cookie.
- Admin session cookie is checked in `middleware.ts` for `/admin` and `/api/admin`.
- Admin mutation APIs validate input before writing to Sheets.
- Public checkout and inquiry routes consume rate-limit attempts.
- Production requires Redis for shared rate limits and Square webhook/order idempotency.
- Square webhook uses the raw body, Square signature header, signature key, and exact notification URL.
- Checkout URL returned by Square is validated before sending it to the browser.
- Security headers include clickjacking and content-type protections.
- Local secret files and service account JSON patterns are ignored by git.

## Admin Auth Model

The admin portal has one shared password:

- `ADMIN_PASSWORD`: required for login.
- `ADMIN_SESSION_SECRET`: strongly required in production; used for signing sessions.
- Cookie: `tno_admin_session`
- Max age: 3 days

Known tradeoff: there is no per-user identity, audit trail, or 2FA. That is acceptable for the current single-operator bakery model, but it is the first auth area to upgrade if more people get admin access.

## Rate Limiting

Production should always set `REDIS_URL`.

Redis-backed limits are shared across Vercel instances. Without Redis, local/preview fallback limits are process-local and less reliable.

Covered flows:

- Public checkout attempts
- Public inquiry attempts
- Admin login attempts
- Square webhook processing/idempotency

## Webhook Verification

Square webhook verification depends on:

- `SQUARE_WEBHOOK_SIGNATURE_KEY`
- `SQUARE_WEBHOOK_NOTIFICATION_URL`
- Raw request body
- `x-square-hmacsha256-signature`

The configured notification URL must match Square exactly. See [PAYMENTS.md](./PAYMENTS.md) for payment flow and recovery behavior.

## Operational Rules

- Keep service account credentials in Vercel env vars, not files.
- Rotate Square, Google, Redis, Blob, and Resend keys if leaked.
- Use Vercel Deployment Protection for Preview if admin env vars are enabled on preview deployments.
- Do not put secrets, customer data, or private operations notes in public routes.
- Run checks before production promotion:

```bash
pnpm env:check
pnpm typecheck
pnpm test:unit
pnpm test:e2e:admin
pnpm build
```

## Known Limits

- Single shared admin password.
- No CSRF token on admin APIs; mitigated by `SameSite=Strict` cookies and no intentional cross-origin admin API usage.
- No queued/retry email system; transient Resend failures require manual follow-up.
- Google Sheets schema changes can break fixed-column writers.
- Preview deployments are not private unless Vercel Deployment Protection is enabled.

## Production Checklist

1. `ADMIN_PASSWORD` is strong and at least 12 characters.
2. `ADMIN_SESSION_SECRET` is separate and at least 32 characters.
3. `REDIS_URL` is set and `pnpm env:check` passes.
4. Square production token, location ID, webhook URL, and signature key all match.
5. Google service account has Editor access to only the intended spreadsheet.
6. Service account JSON is not committed.
7. Resend sender domain and owner inbox are verified.
8. Preview deployments are protected if they expose admin.

## Reporting

Report security issues directly to the site owner. Do not publish exploit details in a public issue or document.
