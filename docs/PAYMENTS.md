# Payments

Audience: developers, deployment maintainers, and operators handling paid-order failures.

The app uses Square hosted checkout for weekly menu orders. Customers choose items on the site, pay on Square, and the Square webhook turns completed website payments into Google Sheets rows and confirmation emails.

Gift boxes and general inquiries use the inquiry form unless a future feature adds gift checkout.

## Flow

```text
Customer form
  -> POST /api/checkout
  -> server builds catalog from current menu
  -> Square checkout link
  -> customer pays on Square
  -> Square payment.updated webhook
  -> verify Square signature
  -> match payment to website order
  -> append Orders and Order Line Items rows
  -> send owner/customer emails
  -> mark payment fulfillment complete
```

## Checkout Route

Route: `POST /api/checkout`

Primary responsibilities:

- Consume public checkout rate limit.
- Reject checkout when weekly ordering is closed.
- Require Square env configuration.
- Read and clamp public JSON input.
- Build the weekly catalog from server-side menu data.
- Validate item slugs, quantities, fulfillment, and delivery city/address.
- Reject sold-out catalog items when the current catalog marks them sold out.
- Create a Square checkout link.
- Allowlist the returned Square URL before returning it to the browser.

Checkout prices come from the server catalog, not the browser cart.

## Menu And Pricing Source

The current menu comes from Google Sheets through `getCurrentMenu()`. Admin menu edits write to Sheets and revalidate the public menu cache.

Fallback menu data in `lib/content/currentMenu.ts` is used only when Sheets is unavailable or has no active rows.

Do not maintain payment pricing in a separate Square-only doc or local note. The canonical weekly product/pricing source is the Sheets-backed menu plus the fallback file.

## Square Setup

Create or use separate Square applications/configuration for sandbox and production.

Required variables:

| Variable | Notes |
|---|---|
| `SQUARE_ACCESS_TOKEN` | Token for sandbox or production. |
| `SQUARE_LOCATION_ID` | Location ID. Do not use Application ID. |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production`. |
| `NEXT_PUBLIC_APP_URL` | Production should be `https://thenurturedoven.com`; preview can use `VERCEL_URL` fallback. |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | From the matching Square webhook subscription. |
| `SQUARE_WEBHOOK_NOTIFICATION_URL` | Exact webhook URL registered in Square. |

## Webhook Setup

Route: `POST /api/webhooks/square`

Square event:

- `payment.updated`

Production notification URL:

```text
https://thenurturedoven.com/api/webhooks/square
```

Sandbox notification URL:

```text
https://<preview-or-tunnel-url>/api/webhooks/square
```

The app verifies Square's HMAC signature using the raw request body. If the signature key or notification URL is missing, the webhook returns an error and does not process payment.

## Payment Matching

The webhook ignores non-website payments. A completed Square payment must match the website order data created before checkout.

Redis is required in production so checkout/order matching and webhook idempotency work across Vercel instances.

## Idempotency And Retry

Production requirement:

```text
REDIS_URL
```

The webhook tracks payment fulfillment phases so duplicate or retried Square events do not intentionally duplicate work.

High-level phases:

- Processing claimed
- Sheet written
- Emails sent
- Completed

If another worker is already processing the same payment, the webhook returns a temporary response with `Retry-After`.

## Google Sheets Writes

On a completed matched payment, the webhook writes:

- One row to `Orders`
- One or more rows to `Order Line Items`

Google Sheets is the operational source of truth for admin order views, production, deliveries, and financials.

Do not manually create website orders in Sheets during normal operation. If a webhook fails, recover using Square/Vercel logs and then decide whether a manual row is needed.

## Emails

Paid-order processing sends:

- Owner notification
- Customer confirmation

Email requires Resend configuration. If email delivery fails or is skipped, the operator should use Square payment details and Google Sheets order data for manual customer follow-up.

Admin customer-update emails are a separate flow from paid-order confirmation emails. They are sent from order detail pages and logged in the `Customer Emails` tab.

## Local Testing

Use sandbox credentials.

```bash
pnpm dev
pnpm env:check
```

For webhook testing, Square must reach your local app through a tunnel such as ngrok or Cloudflare Tunnel. Set the sandbox webhook URL to:

```text
https://<tunnel-url>/api/webhooks/square
```

Sandbox smoke:

1. Open `/contact?intent=weekly-order`.
2. Add a current menu item.
3. Continue to Square checkout.
4. Pay with a sandbox test card.
5. Confirm redirect to `/order/success`.
6. Confirm webhook logs, Sheets rows, and emails.

## Production Smoke

Before announcing checkout:

1. Confirm `pnpm env:check` passes on production values.
2. Confirm Square production webhook URL and signature key match env.
3. Place one small real order.
4. Confirm Square payment completed.
5. Confirm order appears in admin.
6. Confirm Orders and Order Line Items rows.
7. Confirm owner/customer emails.
8. Refund or manually account for the test order if needed.

## Failure Recovery

| Symptom | Likely Cause | Action |
|---|---|---|
| Checkout says unavailable | Square env missing or weekly ordering closed | Check env and ordering schedule/kill switch. |
| Customer paid but order missing in admin | Webhook failed, wrong Square app, Redis/order match issue, Sheets error | Check Square webhook delivery, Vercel logs, Redis env, Sheets credentials. |
| Webhook returns invalid signature | URL/key mismatch | Confirm `SQUARE_WEBHOOK_NOTIFICATION_URL` exactly matches Square dashboard. |
| Duplicate Square events | Normal retry behavior | Idempotency should suppress completed duplicates; inspect logs before manual edits. |
| Email missing | Resend/DNS/key issue or skipped send | Check Resend dashboard and send customer update manually from admin if order exists. |

## Related Docs

- [ENV.md](./ENV.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ADMIN_SOP.md](./ADMIN_SOP.md)
- [SECURITY.md](./SECURITY.md)
