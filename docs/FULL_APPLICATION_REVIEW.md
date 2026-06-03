# Full application code review

Strict consistency and efficiency pass across **customer site**, **admin portal**, **integrations**, and **ops**.  
Companion docs: [COMPLETED_WORK.md](./COMPLETED_WORK.md) (shipped fixes), [SECURITY.md](./SECURITY.md), [ENV.md](./ENV.md).

Last updated: 2026-06-02

**Continued in:** [§16 Deep dive — ordering & contact](#16-deep-dive--ordering-contact--menu) · [§17 Documentation drift](#17-documentation--readme-drift) · [§18 Status model matrix](#18-order-status--payment-status-matrix)

---

## Executive summary

| Area | Grade | Headline |
|------|-------|----------|
| **Order pipeline** (Square → webhook → Sheets → email) | B+ | Solid matching, idempotency hooks, signature verification; silent email failures and dev file store are weak spots |
| **Admin portal** | B | Good middleware + recent type/validation hardening; order status model ≠ sheet reality |
| **Customer site** | B− | Clean server/menu cache; rate limit bug, dynamic root layout, dead components |
| **Shared lib / DX** | B | Strong unit tests on money/fulfillment/webhooks; duplicate intent types, dead re-exports |
| **Ops / CI** | C+ | `pnpm typecheck` + tests exist; no GitHub Actions; Playwright admin smoke only |

**Top 5 fixes (whole app):**

1. Fix `lib/security/rate-limit.ts` to count **every** checkout/inquiry attempt (not only failures).
2. Split **site vs admin layouts** — remove `headers()` from public root (`app/layout.tsx`).
3. Align **`ORDER_STATUS_OPTIONS`** with Google Sheets statuses (`Delivered / Picked Up`, `Cancelled`, …).
4. **`sendPaidOrderEmails` / `sendInquiryEmail`** — treat `skipped: true` and `success: false` explicitly in API responses.
5. Delete **~10 dead customer components** + unused `lib/content/menu.ts` / `webhook-dedupe.ts`.

---

## 1. Cross-cutting architecture

```
                    ┌─────────────────────────────────────┐
                    │  Google Sheets (system of record)  │
                    │  Orders · Lines · Menu · Financials │
                    └──────────────▲──────────────────────┘
                                   │
     ┌──────────────┐    webhook    │    admin APIs
     │ Square       │───────────────┼──────────────┐
     │ Checkout     │               │              │
     └──────┬───────┘               │              │
            │                       │              │
     POST /api/checkout             │         /admin/*
            │                       │              │
            ▼                       ▼              ▼
     ┌──────────────────────────────────────────────────┐
     │              Next.js 14 App Router                │
     │  middleware (admin auth) · RSC pages · API routes │
     └──────────────────────────────────────────────────┘
            │                              │
            ▼                              ▼
     Resend (email)                  Vercel Blob (menu images)
     Redis (optional idempotency)    In-memory rate limits
```

**No Prisma / DB** — repo is Sheets + Square + optional Redis + local `.data/` JSON for dev order store. `AGENTS.md` references Prisma from a template; ignore for this project.

**Path alias:** `@/*` — consistent. Occasional duplicate path casing in tooling (`lib\` vs `lib/`) is Windows-only noise.

---

## 2. Security (application-wide)

| Finding | Severity | Detail |
|---------|----------|--------|
| Public rate limit never increments on success | **CRITICAL** | `checkRateLimit` + `recordRateLimitFailure` only in `catch` on checkout/inquiry. Admin login correctly uses `recordFailedLoginAttempt` on bad password only — same underlying bug pattern but login is less abusable per success path. |
| In-memory rate limits | **HIGH** | Per-instance on Vercel; documented in `SECURITY.md`. |
| Admin: HMAC sessions, middleware, API guards | ✓ Good | `session-token.ts`, `middleware.ts`, `requireAdminApi`, portal `requireAdminPortal` |
| Webhook HMAC | ✓ Good | `app/api/webhooks/square/route.ts` |
| Checkout redirect allowlist | ✓ Good | `safe-external-url.ts` on API; **not** on `MenuOrderButton` external URLs |
| Playbook public | **MEDIUM** | `/playbook` unauthenticated — intentional; no secrets in content |
| Service account at repo root | **LOW** | `the-nurtured-oven-*.json` gitignored; prefer env-only on Vercel |
| Webhook GET probe | **LOW** | Returns endpoint name |

---

## 3. Order pipeline (Square + webhook + store)

### 3.1 Checkout (`lib/square/checkout.ts`, `POST /api/checkout`)

**Good**

- Server-side catalog and prices (`getWeeklyCatalog()`).
- Registers `internalRef` in `website-order-store` before Square redirect.
- Fulfillment metadata via `getWeeklyFulfillmentContext()` (but see menuCycleId issue below).
- Delivery validation aligned with `fulfillmentPolicy`.

**Issues**

| Issue | Severity |
|-------|----------|
| Rate limit ineffective (see §2) | CRITICAL |
| No `soldOut` check at checkout | MEDIUM |
| `menuCycleId` from static `currentMenu.ts` in `weekly-fulfillment.ts`, not live sheet menu | MEDIUM |
| Client `req.json()` without size cap (unlike admin `readAdminJsonBody`) | LOW |

### 3.2 Website order store (`lib/square/website-order-store.ts`)

**Good**

- Bridges checkout → webhook via `squareOrderId` / `internalRef`.
- Redis path when `REDIS_URL` set; file store in dev under `.data/`; `/tmp` on Vercel serverless.

**Issues**

| Issue | Severity |
|-------|----------|
| File store on Vercel `/tmp` is ephemeral — match can fail after cold start if Redis unset | **HIGH** (prod without Redis) |
| In-memory `globalThis` fallback if no path — inconsistent across invocations | MEDIUM |
| `lib/square/webhook-dedupe.ts` re-exports store only — **unused** indirection | LOW |

### 3.3 Webhook (`lib/square/process-payment-webhook.ts`)

**Good**

- Ignores non-payment events and non-`COMPLETED` payments.
- `matchWebsitePayment` filters POS/invoice noise.
- `claimSquarePayment` / `hasProcessedSquarePayment` dedupe.
- On handler error: `releaseSquarePaymentClaim` then 500 (Square retries).

**Issues**

| Issue | Severity |
|-------|----------|
| `sendPaidOrderEmails` ignores `sendEmail` failures (no throw, no rollback) | **MEDIUM** |
| Sheet append runs after email; duplicate sheet rows if email throws after partial send? — email doesn't throw | LOW |
| Owner email failure still returns 200 from webhook if append succeeds | MEDIUM (ops) |

### 3.4 Paid order → Sheets (`lib/google-sheets/append-paid-order.ts`)

**Good**

- Line items + order header; ET timestamps.
- Uses catalog fallback for pricing when needed.

**Issues**

| Issue | Severity |
|-------|----------|
| No duplicate-row guard by `internalRef` if idempotency bypassed | LOW |
| Column positions hardcoded — sheet schema change breaks silently | LOW (documented ops risk) |

---

## 4. Google Sheets layer

**Entry:** `lib/google-sheets/client.ts` — JWT from env, normalized spreadsheet ID, tab ranges.

| Module | Role |
|--------|------|
| `menu.ts` / `menu-admin.ts` | Public menu read vs admin CRUD |
| `orders.ts` | Admin orders + line items + week filters |
| `append-paid-order.ts` | Webhook write path |
| `product-costs.ts`, `weekly-expenses.ts`, `customer-emails.ts` | Admin financials + comms log |

**Good**

- `server-only` on sheet writers where appropriate.
- Menu admin save calls `revalidatePublicMenu()` (`weekly-menu` tag + `/`, `/menu`, `/contact`).

**Issues**

| Issue | Severity |
|-------|----------|
| All-or-nothing failure modes vary by caller (financials now partial-warns; orders page single error) | LOW |
| `soldOut` not parsed from Menu tab | MEDIUM (customer + checkout) |
| No automated schema validation / contract tests for column layouts | LOW |

---

## 5. Email layer (`lib/email/*`, `lib/email.ts`)

**Good**

- HTML + text for inquiry and paid orders; `escapeHtml` in inquiry HTML path.
- `getEmailConfig()` centralizes from/reply-to.
- Customer order update emails (admin) separate module with validation.

**Issues**

| Issue | Severity |
|-------|----------|
| `sendEmail` returns `{ success: true, skipped: true }` when Resend unset | **MEDIUM** — inquiry API returns success; user thinks message sent |
| `sendPaidOrderEmails` does not check send results | **MEDIUM** |
| `sendInquiryEmail` returns success if owner send skipped? — skipped counts as success | MEDIUM |
| No retry / queue for transient Resend failures | LOW |

---

## 6. Admin portal (summary)

Detailed fixes in [COMPLETED_WORK.md](./COMPLETED_WORK.md).

### Remaining issues

| Issue | Severity |
|-------|----------|
| **`ORDER_STATUS_OPTIONS` ⊂ sheet statuses** — UI dropdown uses 8 statuses; seeds/sheets use `Delivered / Picked Up`, `Cancelled`. `StatusSelect` shows disabled “(update to save)” for unknown but `value` coerces to `New` when not in list — easy to overwrite real status accidentally | **HIGH** |
| Financial stats exclude `Cancelled` / `Refunded` but admin can’t set `Cancelled` via dropdown | MEDIUM |
| `buildFinancialDashboardPayload` O(weeks) recompute | LOW (scale) |
| Single shared admin password | Accepted (documented) |

**Good (recent)**

- `FinancialWeekDashboard` vs `FinancialDashboardData` types fixed.
- `api-input.ts` validation on admin mutation APIs.
- Portal layout auth DRY; middleware remains canonical for APIs.

---

## 7. Customer site (summary)

Full detail in [COMPLETED_WORK.md](./COMPLETED_WORK.md) Part 2.

| Issue | Severity |
|-------|----------|
| Rate limit bug | CRITICAL |
| `headers()` in root layout | HIGH |
| ~10 dead components | LOW |
| Homepage ignores closed ordering | MEDIUM |
| `MenuOrderButton` external URLs not allowlisted | MEDIUM |
| FAQ all-client page | LOW |
| No `sitemap.ts` | LOW |

**Good**

- `getCurrentMenu` + `unstable_cache` 300s.
- Checkout server price authority.
- Security headers in `next.config.mjs`.

---

## 8. Menu & catalog consistency

| Source | Used by |
|--------|---------|
| Google Sheets Menu tab | `getCurrentMenu()` → site + `buildWeeklyCatalog()` |
| `lib/content/currentMenu.ts` | Fallback when sheet empty/errors; **`menuCycleId` for Square metadata** |
| `lib/content/menu-from-sheet.ts` | Parser; **`soldOut: false` hardcoded** |

**Fix:** Thread live `menu.menuCycleId` into `getWeeklyFulfillmentContext()` at checkout time; parse `sold_out` column (or active flag) from sheet.

---

## 9. Playbook (`/playbook`)

- Public route; CSS hides site header/footer via `:has(.playbook-doc)`.
- Export via `pnpm playbook:export` (Playwright).
- Not a security boundary — ops doc only.

**LOW:** Still uses root layout path detection; inherits dynamic layout from `headers()` if not split.

---

## 10. Dead code & redundancy inventory

### Customer components (delete candidates)

`TreatGrid`, `EmotionalSection`, `GiftSection`, `RecentBakes`, `RecentBakesGallery`, `FaqTeaser`, `WildFlowerFundSection`, `HeroFundTransition`, `ProductGrid`, `SectionWrapper`.

### Lib (delete or wire)

| Item | Action |
|------|--------|
| `lib/content/menu.ts` | Delete; use `menu-types` + `currentMenu` imports directly |
| `lib/square/webhook-dedupe.ts` | Delete (unused re-export) |
| `resolvePrefillSlug()` in `prefill.ts` | Delete or use |
| `getProductGridClassName()` | Delete with `ProductGrid` |
| `getWeeklyOrderingState()` in `schedule.ts` | Delete or use |

### Type / import smells

- `lib/contact/form-copy.ts` imports `ContactIntent` from **component** — move to `lib/contact/intents.ts`.
- `InquiryIntent` duplicated in `inquiry-email.ts` vs contact intents.

---

## 11. Testing & CI

| Asset | Coverage |
|-------|----------|
| `pnpm test:unit` | ~78 tests — money, fulfillment, webhooks, financials, auth, menu parse, api-input |
| `pnpm test:e2e:admin` | 3 tests — login redirect, API 401 |
| `pnpm typecheck` | Full TS (includes `tests/`, not `scripts/`) |
| **CI workflow** | **None in repo** — run checks locally before deploy |
| Playwright customer journeys | **None** |
| Sheet integration tests | Scripts only (`test-sheets-append.ts`) |

**Recommendation:** GitHub Action: `typecheck` → `test:unit` → `build` → optional `test:e2e:admin` on PR.

---

## 12. Configuration & scripts

| Script | Purpose |
|--------|---------|
| `pnpm env:check` | Tier + masked env diagnostic |
| `pnpm sheets:seed-*` | Month / financials tabs |
| `pnpm sheets:append-menu` | Menu row |
| `pnpm email:preview` | Local HTML previews |
| `pnpm playbook:export` | PDF/JPEG export |

**Good:** `scripts/lib/load-env-local.ts` shared loader.

**Gap:** `scripts/` excluded from `tsconfig` — no typecheck on scripts; acceptable if small.

---

## 13. Accessibility & UX (spot check)

- `useFocusTrap` used in `MobileNav` — good.
- Skip link in root layout — good.
- `docs/a11y.md` exists; no automated axe in CI.
- Admin tables: horizontal scroll on mobile — OK.

---

## 14. Priority matrix (full app)

### P0 — before trusting production abuse protection

1. Rate limit: `recordRateLimitHit()` on each POST (checkout, inquiry).
2. Production `REDIS_URL` for webhook idempotency + website order store (document in deploy checklist).

### P1 — data integrity & trust

3. Unify order statuses (sheet ↔ admin ↔ financials exclusions).
4. Email: fail or warn when Resend skipped; surface in inquiry/checkout responses.
5. Site/admin layout split for static public pages.

### P2 — UX & correctness

6. Homepage/menu ordering-closed gating.
7. Live `menuCycleId` + `soldOut` from sheet; checkout enforcement.
8. Allowlist on `MenuOrderButton` external URLs.

### P3 — maintainability

9. Remove dead components and lib re-exports.
10. Consolidate intent types; fix `form-copy` import direction.
11. FAQ server split; `sitemap.ts`.
12. CI workflow.

---

## 15. What’s in good shape (don’t churn)

- Square webhook signature + website-only payment matching.
- Admin session design and middleware coverage.
- Financial dashboard architecture (week snapshots, chart color fix).
- Menu cache + `revalidatePublicMenu` after admin menu edits.
- Unit test culture on business rules (delivery fee, fulfillment Friday, internal ref format).
- Env documentation and `env:check` script.
- Security headers and robots disallow admin.

---

## 16. Deep dive — ordering, contact & menu

### 16.1 Header banner missing when the weekly window is closed (bug)

`getOrderingPublicState()` in `lib/menu/ordering-gate.ts`:

| State | `bannerNote` (Header) | `closedMessage` (Contact page) |
|-------|----------------------|------------------------------|
| Open | `availability.openNote` | `""` |
| Kill switch (`WEEKLY_ORDERING_DISABLED`) | `availability.closedNote` | `availability.closedNote` |
| **Schedule closed** (Wed noon – Fri 9 AM) | **`""` (empty)** | `availability.closedNote` |

The site header (`app/layout.tsx` → `Header`) only renders the top banner when `bannerNote` is truthy. **During the normal “window closed” period, customers see no header notice**, while `/contact` does show `orderingClosedMessage`. This is inconsistent and likely unintentional.

**Fix:** Set `bannerNote` to `getClosedNote()` or `WEEKLY_ORDERING_CLOSED_MESSAGE` whenever `!isOpen`, not only for the kill switch.

### 16.2 Three “closed” copy sources (consistency)

| Source | Example text | Used on |
|--------|----------------|---------|
| `WEEKLY_ORDERING_CLOSED_MESSAGE` | “orders are closed so we can prep…” | `ClosedMenuCTA`, `getOrderingClosedMessage()` when not kill switch |
| `getClosedNote()` | “ordering window has closed. Sign up…” | `availability.closedNote`, contact `closedMessage` |
| `availability.openNote` | “Order by Wednesday at noon…” | Open header banner |

Product cards use `getDisabledOrderMessage()` → schedule message; contact uses `getClosedNote()`. **Same state, different voice.**

**Fix:** One module `lib/menu/ordering-copy.ts` exported for header, menu CTAs, and contact.

### 16.3 Contact / checkout client flow

**Good**

- Weekly order path uses server checkout; client totals from `calculateOrderTotalCentsFromCatalog` match server rules (display only).
- Intent gating via `getVisibleContactIntentIds` + `resolveContactDefaultIntent` prevents `weekly-order` when closed (unless URL hacking — then default intent resets).
- `resolvePrefillSlugFromCatalog` validates `?item=` against catalog (sync helper on contact page).

**Issues**

| Issue | Severity | Detail |
|-------|----------|--------|
| Success UI before redirect | LOW | Checkout sets `sending` then `window.location.href`; no stuck state if redirect slow |
| Inquiry success when Resend off | MEDIUM | `res.ok` → thank you even if email only logged |
| No client body size cap | LOW | Large `JSON.stringify` on inquiry could hit server limits differently |
| Duplicate contact fields | LOW | ~80 lines duplicated between weekly-order and other intents in `ContactOrderForm.tsx` |
| `catch` sets `errorMessage: null` | LOW | Generic failure with no message on network error |

### 16.4 Catalog building

`buildWeeklyCatalog()` (`lib/order/catalog-build.ts`):

- Maps `menu.items`, then **appends `menu.featured` again** (featured is correctly excluded from `items` in `buildCurrentMenuFromSheetRows`).
- Shell merge `...shell` from `fallbackCurrentMenu` keeps **fallback `menuCycleId`, `orderCta`, `cutoffText`** when sheet only replaces featured + items — sheet does not own those fields today.

**Implication:** Marketing copy on menu can update from sheet rows, but **batch id and global CTAs still come from `currentMenu.ts` fallback** until sheet schema or admin UI extends them.

### 16.5 Menu sheet schema gaps

`MenuSheetRow` / `menu-from-sheet.ts`:

| Field | Sheet | Code today |
|-------|-------|------------|
| `soldOut` | No column | Hardcoded `false` |
| `squareCheckoutUrl` | No column | Hardcoded `""` → all menu order links go to `/contact?intent=weekly-order&item=…` (good for unified checkout) |
| `limitedQuantity` | No column | `false`; `limitedQuantityNote` reuses `row.notes` (same field as **unit label** in `formatPriceLabel`) |
| `menuCycleId` | No column | From `fallbackCurrentMenu` shell only |

**Admin menu editor** (`menu-admin.ts`) writes columns A–L only — aligned with parser. Legacy `currentMenu.ts` **squareCheckoutUrl** values are **not** representable in Sheets.

### 16.6 Homepage always “open”

- `Hero.tsx`: “{featured} is **open for preorder**” — no `isWeeklyOrderingAccepted()` check.
- `ThisWeekMenuSpotlight.tsx`: always shows “Order This Week” → `/contact?intent=weekly-order`.

Closed-window visitors get contradictory messaging (hero vs contact page vs empty header banner).

### 16.7 `ordering-gate` vs `ordering.ts` vs `schedule.ts`

| Function | Module | Role |
|----------|--------|------|
| `isWeeklyOrderingAccepted` | `ordering-gate.ts` | Kill switch + schedule |
| `isMenuOpen` | `ordering.ts` | Alias of above |
| `isWeeklyOrderingWindowOpen` | `schedule.ts` | ET window only |
| `getWeeklyOrderingState` | `schedule.ts` | **Unused** |

Prefer single public entry: `ordering-gate.ts` for “can customer order?” and re-export from `ordering.ts` for ergonomics.

---

## 17. Documentation & README drift

| Doc / file | Problem |
|------------|---------|
| `README.md` | Says update **`currentMenu.ts` only** — production path is **Google Sheets** + `getCurrentMenu()` fallback |
| `README.md` | Lists **Prisma** commands — **no `prisma/` in repo** |
| `README.md` | References `.env.development.example` — repo has **`.env.example`** |
| `README.md` | `pnpm test:e2e` — scripts are `test:e2e` / `test:e2e:admin` (no default e2e suite for whole site) |
| `AGENTS.md` (workspace) | Same Prisma / structure template — misleads agents |
| `public/images/README.md` | Still points at `lib/content/menu.ts` for menu data |

**Fix:** One paragraph in README: “Menu source of truth: Google Sheets Menu tab; fallback `lib/content/currentMenu.ts`; admin edits revalidate tag `weekly-menu`.”

---

## 18. Order status & payment status matrix

### Sheet / seed values (reality)

From `scripts/seed-sheets-month.ts` and business docs:

- `New`, `Baking`, `Packed`, `Ready`, `Delivered / Picked Up`, `Complete`, `Issue`, `Refunded`, `Cancelled`

### Admin `ORDER_STATUS_OPTIONS` (`lib/admin/order-status.ts`)

`New`, `Baking`, `Packed`, `Ready`, `Delivered`, `Complete`, `Issue`, `Refunded` — **no `Cancelled`, no `Delivered / Picked Up`**.

`StatusSelect` shows unknown sheet status as disabled option but **select value falls back to `New`** when unknown — risky if baker opens dropdown and saves without noticing.

### Admin dashboard `CLOSED_STATUSES` (`dashboard-stats.ts`)

Uses `"Delivered"` not `"Delivered / Picked Up"` — **open order count** may treat sheet’s delivered orders as still open.

### Financials (`financial-stats.ts`)

Excludes revenue for `Refunded`, `Cancelled` — **cannot set `Cancelled` via admin dropdown** (only via sheet/manual).

### Customer email validation

Paid-only: `paymentStatus` ∈ `paid` | `completed` — aligned with Square webhook writes.

**Recommendation:** Single `lib/admin/order-status.ts` (or `lib/order/status.ts`) with:

- `ORDER_STATUS_OPTIONS` = full sheet enum
- `REVENUE_EXCLUDED_STATUSES`
- `DASHBOARD_CLOSED_STATUSES`
- `StatusPill` styles for every label

---

## 19. Webhook & paid-order resolution (additional notes)

### 16.8 Payment note vs order metadata

`resolvePaidOrderDetails` merges Square order line items, payment note (`parsePaymentNote`), and order metadata. **Good** fallback chain when webhook payload is thin.

**Edge cases**

| Case | Behavior |
|------|----------|
| Partial webhook payload | Hydrates via `fetchSquarePayment` / `fetchSquareOrder` |
| Non-website Square payment | Ignored with logged reason — good |
| Email send fails | Webhook still 200 if sheet append + mark paid succeed |
| `sendPaidOrderEmails` | No aggregation of Resend errors |

### 16.9 Idempotency layers

1. `hasProcessedSquarePayment` (Redis or file store)
2. `claimSquarePayment` before side effects
3. `releaseSquarePaymentClaim` on handler throw

**Gap:** No sheet-level “already have this `internalRef`” check before append — relies on (1)+(2).

---

## 20. Admin menu & images (spot check)

| Area | Note |
|------|------|
| Menu CRUD | Validates via `menu-item.ts`; revalidates public menu — good |
| Blob uploads | `save-menu-image.ts` + Vercel Blob; remote patterns in `next.config.mjs` |
| Homepage preview | `AdminHomepageDropPreview` reuses `WeeklyDropCards` — good DRY |
| Financials menu merge | `sheetRow: 0` placeholders for menu-only slugs — handled in product-costs PATCH now |

---

## 21. Updated priority matrix (additions from deep dive)

| Priority | New / emphasized item |
|----------|------------------------|
| **P1** | Fix `getOrderingPublicState().bannerNote` when schedule closed |
| **P1** | Align `CLOSED_STATUSES` + `ORDER_STATUS_OPTIONS` with sheet strings |
| **P2** | Unify closed copy; gate homepage Hero + spotlight |
| **P2** | Document menu shell fields (`menuCycleId`, CTA) or add sheet columns |
| **P3** | Fix README / AGENTS.md drift; remove `lib/content/menu.ts` |
| **P3** | Resolve `notes` column dual use (unit label vs limited qty) |

---

## Related files

| Doc | Contents |
|-----|----------|
| [COMPLETED_WORK.md](./COMPLETED_WORK.md) | Implemented admin/security/tooling work |
| [SECURITY.md](./SECURITY.md) | Threat model (update when rate limit fixed) |
| [ENV.md](./ENV.md) | Env vars and local verify commands |
