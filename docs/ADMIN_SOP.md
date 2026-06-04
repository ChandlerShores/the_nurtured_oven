# Admin SOP

Audience: baker, owner/operator, and anyone helping with weekly fulfillment.

Use this document for routine admin work in `/admin`. Technical setup lives in [ENV.md](./ENV.md), deployment in [DEPLOYMENT.md](./DEPLOYMENT.md), and payment recovery in [PAYMENTS.md](./PAYMENTS.md).

## Weekly Rhythm

| Phase | Timing | Operator Focus |
|---|---|---|
| Ordering open | Friday 9:00 AM to Wednesday noon ET | Confirm menu is live, monitor new orders |
| Ordering closed | Wednesday noon to Friday morning | Review production, prep, pack, resolve issues |
| Fulfillment | Friday | Pickups, deliveries, customer updates |
| Emergency close | Any time | Set `WEEKLY_ORDERING_DISABLED=true` in Vercel |

## Admin Areas

| Area | Route | Use |
|---|---|---|
| Dashboard | `/admin` | Current bake-week overview |
| Orders | `/admin/orders` | Status updates and order detail |
| Production | `/admin/production` | Bake quantities by item |
| Deliveries | `/admin/deliveries` | Friday delivery route |
| Pickup | `/admin/pickup` | Friday pickup queue and handoff |
| Menu | `/admin/menu` | Public menu rows, prices, images |
| Financials | `/admin/financials` | Revenue, costs, expenses, margin estimates |
| Settings | `/admin/settings` | Ordering kill switches, sold-out toggles, sync status |

## Login

Open `/admin/login` and use the shared admin password from `ADMIN_PASSWORD`. Sessions last three days. Sign out when finished, especially on shared devices.

If login fails, confirm the password, wait for rate limiting if there were repeated attempts, and verify the relevant Vercel environment has `ADMIN_PASSWORD` set.

## Orders

Paid website orders should appear automatically after Square webhook processing. Do not manually add normal website orders to Sheets.

Use the admin status dropdown instead of editing order status directly in Sheets.

Status flow:

```text
New -> Baking -> Packed -> Ready -> Delivered / Picked Up or Complete
                         -> Issue or Refunded when needed
```

Use `Issue` for orders needing manual follow-up. Use `Refunded` only after verifying the refund/payment state in Square.

Never change `internalRef`; it ties together Square, Sheets, customer emails, and admin links.

## Production

Open `/admin/production` after ordering closes Wednesday. Use the bake quantities as the weekly production list.

The production page prefers the `Order Line Items` tab. If line items are missing, it may fall back to parsing order summaries. If quantities look wrong, compare Orders and Order Line Items in Sheets before baking.

## Deliveries

Use `/admin/deliveries` Thursday or Friday morning.

1. Fix any missing addresses before route planning.
2. Use map links for each stop.
3. Send an "Out for delivery" email from order detail when appropriate.
4. Mark delivered after drop-off.
5. Confirm "Still out" is zero when the route is done.

Use `/admin/pickup` on Friday for the pickup queue (status, mark picked up, customer emails via order detail). Deliveries stay on `/admin/deliveries`.

Orders and Production include a **Bake week** dropdown to review prior fulfillment weeks.

## Menu Updates

Use `/admin/menu` for normal weekly menu changes.

Before ordering opens:

1. Hide inactive or sold-out items.
2. Add/edit item name, description, price, category, sort order, allergens, and notes.
3. Set one active item as featured when needed.
4. Upload an image, use an image URL, or set `image_slug`.
5. Save and verify `/menu` in a private browser window.

On Vercel, image uploads require `BLOB_READ_WRITE_TOKEN`. Without Blob storage, use hosted image URLs or committed files under `public/images/menu/`.

## Customer Emails

Order detail pages can send customer updates through Resend and log them in the `Customer Emails` sheet tab.

Use:

- `Ready for pickup` when pickup orders are ready.
- `Out for delivery` when delivery orders are on the route.
- `Custom` for issue-specific messages.

Always preview before sending. Check email history before resending.

## Financials

Use `/admin/financials` after fulfillment to review estimated profit.

Routine steps:

1. Select the fulfillment week.
2. Review revenue, order count, estimated profit, and margin.
3. Update Product Costs if ingredient or packaging costs changed.
4. Add Weekly Expenses for that fulfillment Friday.
5. Treat figures as estimates unless reconciled against Square and real costs.

Financials exclude refunded/cancelled orders from revenue.

## Payment Failure Recovery

If a customer paid but the order is missing:

1. Check Square payment and webhook delivery.
2. Check Vercel logs for `/api/webhooks/square`.
3. Confirm `REDIS_URL` is set in production.
4. Confirm Google Sheets credentials and tab ranges.
5. Follow [PAYMENTS.md](./PAYMENTS.md) before manually editing Sheets.

## Emergency Ordering Close

**Preferred (no redeploy):** `/admin/settings` → **Stop all ordering** → **Close ordering now**. Stored in Redis when `REDIS_URL` is set (production).

**Per-item sold out:** Same page → **Item sold-out** → **Mark sold out** on one active menu row. Checkout blocks that item only; the rest of the week can stay open.

**Environment lock (overrides admin toggle):** In Vercel:

```text
WEEKLY_ORDERING_DISABLED=true
```

Redeploy if needed. Remove it or set it false to return to schedule-based control from admin.

## Related Docs

- [ENV.md](./ENV.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [PAYMENTS.md](./PAYMENTS.md)
- [SECURITY.md](./SECURITY.md)
