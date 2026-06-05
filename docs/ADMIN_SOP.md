# Admin SOP

Audience: baker, owner/operator, and anyone helping with weekly fulfillment.

Use this document for routine admin work in `/admin`. Technical setup lives in [ENV.md](./ENV.md), deployment in [DEPLOYMENT.md](./DEPLOYMENT.md), and payment recovery in [PAYMENTS.md](./PAYMENTS.md).

## Weekly Rhythm

| Phase | Timing | Operator Focus |
|---|---|---|
| Ordering open | Friday 9:00 AM to Wednesday noon ET | Confirm menu is live, monitor new orders |
| Ordering closed | Wednesday noon to Friday morning | Review orders, prep, pack, resolve issues |
| Fulfillment | Friday | Pickups, deliveries, customer updates |
| Emergency close | Any time | Set `WEEKLY_ORDERING_DISABLED=true` in Vercel |

## Admin Areas

| Area | Route | Use |
|---|---|---|
| Dashboard | `/admin` | Bake-week overview; ordering-window pace when menu is open; week goals |
| Orders | `/admin/orders` | Status updates and order detail (`?status=Issue` for follow-ups) |
| Deliveries | `/admin/deliveries` | Friday route; bulk out-for-delivery emails |
| Pickup | `/admin/pickup` | Pickup queue; bulk ready-for-pickup emails |
| Menu | `/admin/menu` | Public menu rows, prices, images |
| Financials | `/admin/financials` | Revenue, costs, expenses, margin estimates |
| Settings | `/admin/settings` | Default goal backup, ordering kill switches, sold-out toggles, sync status |

## Weekly goals

When the menu opens (Friday morning):

1. **Financials** (`/admin/financials`) — select the bake week, scroll to the bottom, and set revenue ($) and order count for that week.
2. **Admin notes** (`/admin/settings`) — optional **default backup** row (`fulfillment_date` = `default`) used when a week has no saved targets.

Progress appears on the dashboard and at the top of financials. You can also edit the **Weekly Goals** tab directly in Google Sheets.

Env vars (`WEEKLY_REVENUE_GOAL_CENTS`, `WEEKLY_ORDER_GOAL_COUNT`) are only a fallback if the sheet has no value.

## Login

Open `/admin/login` and use the shared admin password from `ADMIN_PASSWORD`. Sessions last three days. Sign out when finished, especially on shared devices.

If login fails, confirm the password, wait for rate limiting if there were repeated attempts, and verify the relevant Vercel environment has `ADMIN_PASSWORD` set.

## Orders

Paid website orders should appear automatically after Square webhook processing. Do not manually add normal website orders to Sheets.

Use the admin status dropdown instead of editing order status directly in Sheets.

Status flow:

```text
New -> In progress -> Ready -> Delivered / Picked Up
                         -> Issue or Refunded when needed
```

Legacy sheet values `Baking`, `Packed`, and `Complete` still display correctly but map to **In progress** or **Delivered / Picked Up** in filters and bulk actions.

Use `Issue` for orders needing manual follow-up. The dashboard **Needs attention** queue links to `/admin/orders?status=Issue`. Use `Refunded` only after verifying the refund/payment state in Square.

On `/admin/orders`, use **All → In progress** (New orders only) at the start of bake day, then **All → Ready** when packed. Both use a confirmation dialog and skip finished or downstream statuses.

Never change `internalRef`; it ties together Square, Sheets, customer emails, and admin links.

## Deliveries

Use `/admin/deliveries` Thursday or Friday morning.

1. Fix any missing addresses before route planning.
2. Use map links for each stop.
4. **Bulk out-for-delivery emails:** preview counts and already-sent warnings, then send to eligible delivery orders (Ready or In progress).
5. Mark delivered after drop-off.
6. Confirm "Still out" is zero when the route is done.

Use `/admin/pickup` on Friday for the queue. **Preview** then **Send** on the Notify section for Ready orders. Single-order emails are on order detail or Messages.

## Messages

Use `/admin/messages` to review every customer email logged for the selected bake week and to **send** the same per-order updates as the order detail page (Ready for Pickup, Out for Delivery, or Custom). Pick a paid order from the dropdown, preview, and confirm. Use Pickup or Deliveries for bulk sends to many customers at once.

Orders and Pickup include a **Bake week** dropdown to review prior fulfillment weeks.

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
5. Set or adjust **goals for this bake week** at the bottom of the page.
6. Treat figures as estimates unless reconciled against Square and real costs.

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
