# TODO: Google Calendar in Admin Portal (Option 2)

**Status:** Not started — pick up here when ready.  
**Goal:** Manage a shared **operations Google Calendar** from the baker portal using the **Google Calendar API** (not embed-only). Same auth pattern as Sheets: service account + calendar shared with that account.

**Out of scope for v1 (optional later):** OAuth to a personal Gmail calendar; two-way sync with Sheets orders; public customer-facing calendar.

---

## Google Cloud / Calendar setup (do first)

- [ ] In Google Cloud (same project as Sheets service account), enable **Google Calendar API**.
- [ ] Create a dedicated calendar (e.g. **The Nurtured Oven – Operations**) in Google Calendar, or use an existing team calendar.
- [ ] **Share** that calendar with `GOOGLE_SERVICE_ACCOUNT_EMAIL` → permission **Make changes to events** (same as sharing a Sheet).
- [ ] Copy the calendar ID (Settings → Integrate calendar → Calendar ID, often `...@group.calendar.google.com`).
- [ ] Add env vars (document in `docs/ENV.md` when implemented):
  - `GOOGLE_CALENDAR_ID` — required for calendar features
  - Reuse `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`
- [ ] Extend JWT scopes in calendar client (do **not** widen Sheets client scope globally unless both are needed on every call):
  - `https://www.googleapis.com/auth/calendar` or narrower `calendar.events`
- [ ] Add to `.env.production.example`, `.env.preview.example`, and local `.env.local`.
- [ ] Run `pnpm env:check` after wiring (extend script to report calendar configured).

---

## Code structure (mirror `lib/google-sheets/`)

- [ ] `lib/google-calendar/client.ts` — `getCalendarClient()` using `google.auth.JWT` + Calendar API v3.
- [ ] `lib/google-calendar/events.ts` — list events in range, get by id, create, update, delete.
- [ ] `lib/google-calendar/types.ts` — portal-facing event shape (id, title, start, end, allDay, description, colorId optional).
- [ ] `lib/google-calendar/bakery-events.ts` (optional v1.1) — helpers to build standard events from bake week:
  - Ordering opens (Fri 9:00 AM ET)
  - Order cutoff (Wed 12:00 PM ET)
  - Prep day (Wed before fulfillment Friday)
  - Fulfillment Friday (from `getWeeklyFulfillmentContext` / operational week)
- [ ] Keep timezone **`America/New_York`** consistent with `lib/menu/schedule.ts` and `lib/order/weekly-fulfillment.ts`.

---

## API routes (admin-only)

All routes behind existing `requireAdminApi()` (see `app/api/admin/`).

- [ ] `GET /api/admin/calendar/events?timeMin=&timeMax=` — list events for UI range (default: current month ± 1).
- [ ] `POST /api/admin/calendar/events` — create event (title, start, end, description, allDay).
- [ ] `PATCH /api/admin/calendar/events/[eventId]` — update event.
- [ ] `DELETE /api/admin/calendar/events/[eventId]` — delete event.
- [ ] Rate limiting / input clamping via existing `lib/security/public-input` patterns.
- [ ] Clear error messages when calendar not shared or `GOOGLE_CALENDAR_ID` missing.

---

## Admin UI

- [ ] New page: `app/admin/(portal)/calendar/page.tsx` (server loads initial month range).
- [ ] Client view: `components/admin/AdminCalendarView.tsx`:
  - Month (or week) grid — consider a small dependency (e.g. FullCalendar) **or** minimal custom grid to avoid bundle bloat; decide when implementing.
  - Click day → create/edit modal or slide-over form.
  - Link **Open in Google Calendar** (web URL for same calendar id) as escape hatch.
- [ ] Add nav item in `components/admin/AdminSidebar.tsx` (e.g. **Calendar** between Dashboard and Orders, or after Financials).
- [ ] Optional dashboard card: “This week on the calendar” with next 3 events + link to `/admin/calendar`.
- [ ] Match existing admin UI: `DashboardCard`, `adminBtnPrimary`, `FinancialsSection`-style headings if the page is long.

---

## Security & ops

- [ ] Document in `docs/SECURITY.md`: calendar scope, shared-calendar model, no customer PII in event titles by default.
- [ ] Update `docs/ADMIN_SOP.md` with when to use portal calendar vs Google app on phone.
- [ ] Production: verify service account can list/create on Vercel after deploy (common failure: calendar not shared with SA email).

---

## Testing

- [ ] Unit tests: `lib/google-calendar/` parsers/helpers (mock API or fixture JSON), Eastern boundary cases.
- [ ] Manual QA checklist:
  - Create / edit / delete event in portal → appears in Google Calendar app
  - Change in Google app → visible after refresh in portal
  - Admin session required; 401 without login
- [ ] Optional: `scripts/test-calendar.ts` to list next 7 days from CLI (like ordering-window script).

---

## Implementation order (suggested)

1. Google setup + env + `getCalendarClient()` + list events API + minimal read-only admin page.  
2. Create / update / delete + form UI.  
3. Sidebar + docs + `env:check`.  
4. (Later) Auto-seed recurring bake-week markers from `bakery-events.ts` + “Sync this week to calendar” button.

---

## Reference in codebase today

| Area | Path |
|------|------|
| Sheets auth pattern | `lib/google-sheets/client.ts` |
| Admin API auth | `lib/admin/require-admin.ts` |
| Bake week / ET dates | `lib/order/weekly-fulfillment.ts`, `lib/menu/schedule.ts` |
| Prep deadline copy | `lib/admin/prep-deadline.ts` |
| Admin layout / nav | `components/admin/AdminSidebar.tsx` |

---

## Open decisions (resolve when starting)

- [ ] **Calendar library:** custom month grid vs FullCalendar (bundle size vs speed).
- [ ] **Event types:** free-form only v1, or typed events (Fulfillment / Prep / Ordering window) with colors?
- [ ] **Auto-sync:** manual only v1, or one-click “Add standard week events” for operational bake week?
- [ ] **Dashboard integration:** full card vs link-only in quick nav.

---

*Last discussed: Option 2 (Calendar API + manage from portal). Embed-only (Option 1) explicitly not chosen.*
