# Environment Variables

Audience: developers and deployment maintainers.

This project uses different values for local development, Vercel Preview, and Vercel Production. Do not commit secrets. Use the example files as templates only.

| Environment | Template / Location | Square Mode | URL |
|---|---|---|---|
| Local | `.env.example` copied to `.env.local` | Sandbox | `http://localhost:3000` |
| Vercel Preview | `.env.preview.example` values in Vercel Preview | Sandbox | `https://*.vercel.app` |
| Vercel Production | `.env.production.example` values in Vercel Production | Production | `https://thenurturedoven.com` |

Run this after changing env values:

```bash
pnpm env:check
```

## Required In Production

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Canonical public URL for redirects and Square return URLs. Production should be `https://thenurturedoven.com`. |
| `SQUARE_ACCESS_TOKEN` | Square access token for the selected environment. |
| `SQUARE_LOCATION_ID` | Square Location ID, not the Application ID. |
| `SQUARE_ENVIRONMENT` | `production` on live site, `sandbox` on local/preview. |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Signature key from the matching Square webhook subscription. |
| `SQUARE_WEBHOOK_NOTIFICATION_URL` | Exact URL registered in Square, usually `https://thenurturedoven.com/api/webhooks/square`. |
| `REDIS_URL` | Required in production for shared rate limits, webhook idempotency, and checkout/order matching across server instances. |
| `ADMIN_PASSWORD` | Shared admin login password. Use at least 12 characters. |
| `ADMIN_SESSION_SECRET` | Separate random session signing secret. Use at least 32 characters. |
| `GOOGLE_SHEET_ID` | Spreadsheet ID for orders, menu, financials, and email logs. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account email. |
| `GOOGLE_PRIVATE_KEY` | Google service account private key. |

## Optional / Shared

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Enables transactional email. Without it, email helpers may skip sends in local/dev contexts. |
| `OWNER_EMAIL` | Owner notification inbox. |
| `EMAIL_FROM_ADDRESS` | From address for transactional email. |
| `EMAIL_FROM_NAME` | Display name for transactional email. |
| `EMAIL_REPLY_TO` | Reply-to address. |
| `BLOB_READ_WRITE_TOKEN` | Required for admin menu image uploads on Vercel. Local dev writes to `public/images/menu/`. |
| `WEEKLY_ORDERING_DISABLED` | Emergency kill switch. Set `true`, `1`, or `yes` to close weekly checkout. |
| `ORDERING_TEST_WEEKDAY` | Local `pnpm dev` only. Fakes weekly ordering schedule for development. Ignored on Vercel. |
| `FINANCIAL_LABOR_RATE_PER_HOUR` | Labor estimate for financials. Default: `22`. |
| `FINANCIAL_SQUARE_FEE_BPS` | Square fee basis points for estimates. Default: `290`. |
| `FINANCIAL_SQUARE_FEE_FIXED_CENTS` | Square fixed fee estimate. Default: `30`. |

## App URL Resolution

Server code resolves the public URL in this order:

1. `NEXT_PUBLIC_APP_URL`
2. `https://${VERCEL_URL}`
3. `http://localhost:3000`

Production should set `NEXT_PUBLIC_APP_URL`. Preview can usually leave it unset so each deploy uses its own `VERCEL_URL`.

## Square Webhook Variables

Square webhook verification requires both:

- `SQUARE_WEBHOOK_SIGNATURE_KEY`
- `SQUARE_WEBHOOK_NOTIFICATION_URL`

The notification URL must exactly match the URL registered in the Square Developer Dashboard, including scheme, domain, path, and trailing slash behavior.

Expected event subscriptions:

| Environment | Event | URL |
|---|---|---|
| Production Square app | `payment.updated` | `https://thenurturedoven.com/api/webhooks/square` |
| Sandbox Square app | `payment.updated` | Preview URL or tunnel URL + `/api/webhooks/square` |

Payment details live in [PAYMENTS.md](./PAYMENTS.md).

## Google Sheets

The service account must have Editor access to the spreadsheet.

Required setup:

1. Enable Google Sheets API in Google Cloud.
2. Create a service account key.
3. Share the spreadsheet with the service account email as Editor.
4. Put `client_email` in `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
5. Put `private_key` in `GOOGLE_PRIVATE_KEY`.

## Sheets Ranges

| Variable | Default | Purpose |
|---|---|---|
| `GOOGLE_SHEETS_ORDERS_RANGE` | `Orders!A:R` | Paid order header rows |
| `GOOGLE_SHEETS_LINE_ITEMS_RANGE` | `Order Line Items!A:M` | Paid order line items |
| `GOOGLE_SHEETS_MENU_RANGE` | `Menu!A:L` | Public/admin menu rows |
| `GOOGLE_SHEETS_CUSTOMER_EMAILS_RANGE` | `Customer Emails!A:J` | Admin customer email log |
| `GOOGLE_SHEETS_PRODUCT_COSTS_RANGE` | `Product Costs!A:G` | Product cost estimates |
| `GOOGLE_SHEETS_WEEKLY_EXPENSES_RANGE` | `Weekly Expenses!A:J` | Weekly expenses |
| `GOOGLE_SHEETS_RANGE` | none | Legacy alias for orders range only |

Important: the parser understands an optional `sold_out` column after `notes`, but the current default range and admin save path are `Menu!A:L`. If you add a manual `sold_out` column, set `GOOGLE_SHEETS_MENU_RANGE=Menu!A:M` and verify admin saves before relying on it operationally.

## Required Tab Headers

### Menu

Default columns A-L:

`slug`, `name`, `description`, `price`, `active`, `featured`, `category`, `sort_order`, `image_slug`, `image_url`, `allergens`, `notes`

Optional column M:

`sold_out`

Only active rows appear publicly. Rows are sorted by `sort_order`. If Sheets is unavailable or has no active rows, the app uses `lib/content/currentMenu.ts`.

### Orders

The paid-order webhook writes order rows to the `Orders` tab and line items to `Order Line Items`. Do not change these columns casually; the sheet writers use fixed column order.

### Customer Emails

Header row:

`Timestamp`, `Internal reference`, `Square order ID`, `Customer name`, `Customer email`, `Email type`, `Subject`, `Message`, `Sent status`, `Resend message ID`

### Product Costs

Header row:

`Item slug`, `Item name`, `Ingredient cost per unit`, `Packaging cost per unit`, `Labor minutes per unit`, `Active`, `Notes`

### Weekly Expenses

Header row:

`Expense timestamp`, `Expense date`, `Fulfillment date`, `Category`, `Vendor`, `Description`, `Amount`, `Payment method`, `Notes`

Seed financial tabs:

```bash
pnpm sheets:seed-financials
```

## Redis

Production requires `REDIS_URL`.

Redis is used for:

- Shared checkout, inquiry, and admin login rate limits.
- Square webhook idempotency.
- Payment fulfillment phase tracking.
- Website checkout/order matching across server instances.

Local and Preview can run without Redis, but rate limits and webhook/order matching become best-effort process or file state.

## Common Mistakes

- Putting Square Application ID in `SQUARE_LOCATION_ID`.
- Mixing a production Square token with `SQUARE_ENVIRONMENT=sandbox`, or the reverse.
- Setting a Square webhook URL that does not exactly match `SQUARE_WEBHOOK_NOTIFICATION_URL`.
- Forgetting to redeploy after changing Vercel env vars.
- Giving the Google service account Viewer access instead of Editor.
