# Security overview

Threat model: a small bakery site with public ordering, Square webhooks, Google Sheets as the system of record, and a password-protected admin portal. Not multi-tenant SaaS.

## Attack surfaces

| Surface | Auth | Notes |
|---------|------|--------|
| `/admin`, `/api/admin/*` | Session cookie (HMAC) | Middleware + per-route checks. See `docs/ENV.md` admin section. |
| `/api/checkout` | None (public) | Rate-limited; catalog prices from server; checkout URL allowlisted to Square HTTPS hosts. |
| `/api/inquiry` | None | Rate-limited; input length caps; HTML email escaped. |
| `/api/webhooks/square` | HMAC signature | Rejects unsigned payloads. Use production notification URL + signature key on Vercel. |
| `/playbook` | **None** | Owner operations doc is public if deployed. Do not put secrets in playbook content. |
| Google Sheets | Service account | Editor on one spreadsheet only; credentials server-only. |
| Resend / Square / Redis | API keys in env | Never `NEXT_PUBLIC_`; rotate in Vercel if leaked. |

## What we defend against

- Brute-force admin login (rate limit + delay + strong password length)
- Session forgery (signed cookie, optional `ADMIN_SESSION_SECRET`)
- Open redirect after checkout (Square URL allowlist before browser redirect)
- Webhook spoofing (Square signature verification)
- XSS in outbound email (`escapeHtml` on user fields; `htmlButton` HTTPS allowlist)
- Accidental secret commit (`.env*.local`, `*the-nurtured-oven-*.json` in `.gitignore`)
- Clickjacking on public pages (`X-Frame-Options: DENY`)

## Known limits (accept or upgrade later)

- **In-memory rate limits** — Best-effort per server instance; use Vercel WAF / Upstash for global limits if abused at scale.
- **Single admin password** — No per-user audit trail or 2FA.
- **No CSRF tokens on admin APIs** — Mitigated by `SameSite=Strict` session cookie; XSS on your origin is the main residual risk.
- **Preview deployments** — If `ADMIN_PASSWORD` is set on Preview, protect preview URLs (Vercel Deployment Protection).
- **Email spam** — Inquiry/checkout rate limits reduce abuse; Resend quotas are the backstop.
- **Dependency CVEs** — Run `pnpm audit` periodically.

## Production checklist

1. `ADMIN_PASSWORD` ≥ 12 characters (random)
2. `ADMIN_SESSION_SECRET` ≥ 32 characters (random, separate from password)
3. Square webhook URL + signature key match the live endpoint
4. `REDIS_URL` in production for webhook idempotency (recommended)
5. Service account JSON **not** in git; only Vercel env vars
6. `pnpm env:check` before promote
7. Optional: Vercel Deployment Protection on Preview

## Reporting

If you find a security issue, contact the site owner directly (do not open a public issue with exploit details).
