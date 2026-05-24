# Square checkout — setup to-do

The site code for weekly order + pay at checkout is in place. **Checkout will not work until the client’s Square credentials are configured.** Gift orders still use the inquiry form (no Square required).

Use this list when you get access to the client’s Square account (or they invite you to their Square Developer Dashboard).

---

## Before you start

- [ ] Client grants you access to their [Square Developer Dashboard](https://developer.squareup.com/apps) (or shares credentials securely — never commit tokens to git).
- [ ] Confirm which Square account/location is used for The Nurtured Oven (production vs. a test seller).
- [ ] Copy `.env.example` → `.env.local` (local) and set the same variables in production hosting (Vercel, etc.).

---

## Square Developer Dashboard

- [ ] Open (or create) the Square application for this site.
- [ ] **Sandbox (testing):** copy Sandbox Access Token and Sandbox Location ID.
- [ ] **Production (live):** copy Production Access Token and Production Location ID.
- [ ] Set `SQUARE_ENVIRONMENT=sandbox` while testing; switch to `production` only when going live.

### Environment variables

| Variable | Where to find it |
|----------|------------------|
| `SQUARE_ACCESS_TOKEN` | Developer Dashboard → application → Credentials |
| `SQUARE_LOCATION_ID` | Square Dashboard → Locations, or Locations API / Developer test tools |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production` |
| `NEXT_PUBLIC_APP_URL` | Public site URL, no trailing slash (e.g. `https://thenurturedoven.com`) |

- [ ] Add all of the above to `.env.local` for local dev.
- [ ] Add the same values to production environment settings before launch.

---

## Webhooks (order confirmation emails)

Without webhooks, customers can still pay on Square, but **you and the customer may not get the site’s confirmation emails** after payment.

- [ ] In Developer Dashboard → **Webhooks**, add subscription:
  - **Notification URL:** `{NEXT_PUBLIC_APP_URL}/api/webhooks/square`  
    Example: `https://thenurturedoven.com/api/webhooks/square`
  - **Event:** `payment.updated`
- [ ] Copy the webhook **signature key** → `SQUARE_WEBHOOK_SIGNATURE_KEY`
- [ ] Set `SQUARE_WEBHOOK_NOTIFICATION_URL` to the **exact same URL** as registered in Square (required for signature verification).

### Local webhook testing (optional)

- [ ] Use a tunnel (ngrok, Cloudflare Tunnel, etc.) so Square can reach `localhost` during sandbox testing.
- [ ] Update sandbox webhook URL to the tunnel URL + `/api/webhooks/square`.
- [ ] Place a sandbox test order and confirm webhook hits `/api/webhooks/square` (check server logs).

---

## Email (Resend)

- [ ] Confirm `RESEND_API_KEY` is set in production (already used for inquiry forms).
- [ ] Confirm `OWNER_EMAIL` is the inbox that should receive paid-order notifications.
- [ ] After a test payment, verify owner + customer confirmation emails arrive (or log to console if Resend is unset locally).

---

## Menu pricing (client sign-off)

Checkout prices are defined in `lib/content/currentMenu.ts` as `priceCents` (not the display-only `priceLabel`). Paste per-item `squareCheckoutUrl` values there when using Square payment links directly. Weekly open/closed is automatic (Fri 9 AM – Wed noon ET) via `lib/menu/schedule.ts` — no manual status field.

- [ ] Confirm with client:
  - Brown Butter Chocolate Chip Cookies — $21 / 6-pack (`2100`)
  - Salted Caramel Brownies — $16 / 4-pack (`1600`)
  - Biscoff Cloud Bars — $16 / 4-pack (`1600`)
  - Weekly Comfort Box — $33 (`3300`)
- [ ] Update `priceCents` and `priceLabel` if prices change.
- [x] Delivery fee at checkout: $7 for Georgetown/Lexington delivery when subtotal under $40; waived at $40+ (`lib/order/delivery-fee.ts`).

---

## Testing checklist

### Sandbox

- [ ] `pnpm dev` with sandbox env vars loaded.
- [ ] Go to **Order & Contact** → **Place a Weekly Order**.
- [ ] Add items, fill form, click **Continue to payment**.
- [ ] Complete payment on Square’s hosted checkout (sandbox test card).
- [ ] Land on `/order/success`.
- [ ] Confirm paid-order emails (or console logs) for owner and customer.

### Production

- [ ] Switch `SQUARE_ENVIRONMENT=production` and production tokens.
- [ ] Update webhook URL to production domain.
- [ ] One real small test order before announcing checkout to customers.

---

## Go-live / copy

- [ ] Site copy already describes pay-at-checkout for weekly orders; no code change needed unless client wants different wording.
- [ ] Train client: weekly orders = website checkout; gift boxes = inquiry form until gift checkout is built (if ever).
- [ ] Document for client how to view orders/payments in Square Dashboard.

---

## Optional follow-ups (not blocking launch)

- [ ] Square checkout for gift Comfort Box tiers (variable pricing).
- [ ] Delivery fee ($7; waived $40+) as a Square line item or service charge when automating checkout.
- [ ] Admin view of orders on the site (today: Square Dashboard + email only).
- [ ] Idempotent webhook handling if duplicate `payment.updated` events become an issue.

---

## Quick reference — files touched by integration

| Area | Path |
|------|------|
| Checkout API | `app/api/checkout/route.ts` |
| Webhook | `app/api/webhooks/square/route.ts` |
| Square client | `lib/square/client.ts`, `lib/square/checkout.ts` |
| Weekly menu data | `lib/content/currentMenu.ts` |
| Menu page UI | `app/menu/page.tsx`, `components/menu/*` |
| Order UI | `components/contact/ContactOrderForm.tsx`, `components/order/WeeklyOrderCart.tsx` |
| Success page | `app/order/success/page.tsx` |
| Env template | `.env.example` |

---

## Blocked until client provides

- Square Developer Dashboard access (or tokens + location ID shared securely).
- Production domain for `NEXT_PUBLIC_APP_URL` and webhook URL.
- Final confirmation of menu prices for `priceCents`.
