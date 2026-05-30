# Week 1 menu launch — changes and revert guide

First weekly menu launch: weekly ordering + **Weekly Comfort Box** on the menu. Gift Comfort Box tiers and Little Extras are hidden from navigation and contact flows until a later release.

**Last updated:** 2026-05-28

---

## Current launch flags

In [`lib/content/launch.ts`](../lib/content/launch.ts):

| Flag | Week 1 value | Meaning |
|------|----------------|---------|
| `giftComfortBoxesEnabled` | `false` | Hide `/gifts` from nav/CTAs; no gift contact intent |
| `littleExtrasEnabled` | `false` | Hide `/little-extras` from nav/CTAs; no menu Little Extras band |

---

## What we changed

### New files

| File | Purpose |
|------|---------|
| [`lib/content/launch.ts`](../lib/content/launch.ts) | Central toggles + helpers (`getPublicNav`, `getClosedNote`, FAQ/contact filters) |
| [`lib/contact/intents.ts`](../lib/contact/intents.ts) | Shared contact intent IDs (avoids server importing client components) |
| `docs/LAUNCH_WEEK1.md` | This document |

### Menu content

This week's menu is a curated three-item lineup. The Weekly Comfort Box is deferred this week (no longer the featured item).

| Role | Item | Image |
|------|------|-------|
| Featured | Cinnamon Rolls | `/images/cinnamon_roll_hero.png` |
| Signature Staple | Oatmeal Cookie | `/images/oatmeal_cookie_spring.png` (in repo) |
| Special Treat | Marshmallow Cloud Bar | `/images/marshmallow-cloud-bar.png` |

| File | Change |
|------|--------|
| [`lib/content/currentMenu.ts`](../lib/content/currentMenu.ts) | `menuCycleId: "2026-05-30"`; `littleExtrasCallout.enabled: false`; featured set to Cinnamon Rolls; two supporting items (Oatmeal Cookie, Marshmallow Cloud Bar). Prices are placeholders (~$16-21) pending confirmation. |
| [`lib/content/menu-types.ts`](../lib/content/menu-types.ts) | Added optional `roleLabel`, `featuredEyebrow`; made `includes` optional. |

**Images to upload before deploy:** `marshmallow-cloud-bar.png` is still referenced but not yet in `public/images/`. Add it (or update the path in `currentMenu.ts`) before going live. Cinnamon Rolls use `cinnamon_roll_hero.png` (in repo).

### Menu and homepage layout (Week 1 focus)

| File | Change |
|------|--------|
| [`components/menu/MenuHero.tsx`](../components/menu/MenuHero.tsx) | Preorder-forward copy + soft botanical accents |
| [`components/menu/FeaturedProduct.tsx`](../components/menu/FeaturedProduct.tsx) | `featuredEyebrow`, larger image, anchor `id="this-weeks-feature"`, optional `includes` |
| [`components/menu/SupportingMenuItems.tsx`](../components/menu/SupportingMenuItems.tsx) | New 2-up curated section (replaces generic grid) |
| [`components/menu/OrderingStrip.tsx`](../components/menu/OrderingStrip.tsx) | New compact cutoff/fulfillment strip linking to `#order-cta` |
| [`components/menu/ProductCard.tsx`](../components/menu/ProductCard.tsx) | Adds `roleLabel` + per-item order button |
| [`components/menu/OrderCTA.tsx`](../components/menu/OrderCTA.tsx) | Anchor `id="order-cta"` |
| [`app/menu/menu-curate.css`](../app/menu/menu-curate.css) | New menu-scoped styling (botanical watermark, soft radius) |
| [`components/home/Hero.tsx`](../components/home/Hero.tsx) | Menu-forward copy, feature image, CTAs to `/menu` and `/menu#order-cta` |
| [`components/home/ThisWeekMenuSpotlight.tsx`](../components/home/ThisWeekMenuSpotlight.tsx) | New homepage spotlight driven by `currentMenu` (replaces `TreatGrid`) |
| [`app/page.tsx`](../app/page.tsx) | Uses spotlight; removes `TreatGrid` and `RecentBakes` for Week 1 |
| [`components/home/HowItWorks.tsx`](../components/home/HowItWorks.tsx) | Step 2 copy no longer mentions Weekly Comfort Box |

To restore the homepage `TreatGrid`/`RecentBakes` later, re-add their imports and JSX in [`app/page.tsx`](../app/page.tsx).

### Navigation and layout

| File | Change |
|------|--------|
| [`components/layout/Header.tsx`](../components/layout/Header.tsx) | Uses `getPublicNav()` instead of full `siteConfig.nav` |
| [`components/layout/MobileNav.tsx`](../components/layout/MobileNav.tsx) | Same |

Full nav remains documented in [`lib/content/site.ts`](../lib/content/site.ts) for when flags are re-enabled.

### Homepage

| File | Change |
|------|--------|
| [`components/home/Hero.tsx`](../components/home/Hero.tsx) | Secondary CTA → “Order the Weekly Comfort Box” → `/menu#weekly-comfort-box` (was “Send a Comfort Box” → `/gifts`) |
| [`components/home/GiftSection.tsx`](../components/home/GiftSection.tsx) | Section not rendered when `giftComfortBoxesEnabled` is false |
| [`components/home/TreatGrid.tsx`](../components/home/TreatGrid.tsx) | Hides Comfort Boxes + Little Extras cards |
| [`components/home/FaqTeaser.tsx`](../components/home/FaqTeaser.tsx) | Uses `getHomepageFaqEntries()` (no gift-tier teaser) |

### Menu page

| File | Change |
|------|--------|
| [`components/menu/FeaturedProduct.tsx`](../components/menu/FeaturedProduct.tsx) | `id="weekly-comfort-box"` for hero deep link |
| [`components/menu/ClosedMenuCTA.tsx`](../components/menu/ClosedMenuCTA.tsx) | “Request a future gift box” hidden when gifts disabled |

### Copy

| File | Change |
|------|--------|
| [`lib/content/availability.ts`](../lib/content/availability.ts) | `closedNote` from `getClosedNote()` (no gift / Little Extras mentions while disabled) |

### Contact

| File | Change |
|------|--------|
| [`components/contact/ContactPageContent.tsx`](../components/contact/ContactPageContent.tsx) | Gift intent removed; default intent is `weekly-order` or `reminder` (not `gift`) |
| [`app/api/inquiry/route.ts`](../app/api/inquiry/route.ts) | `400` if `intent=gift` while gifts disabled |

### FAQ

| File | Change |
|------|--------|
| [`app/faq/page.tsx`](../app/faq/page.tsx) | `getPublicFaqEntries()` hides gift-tier + Little Extras questions; softens “ordering closed” answer |

---

## What stays available (unchanged paths)

- **Weekly menu:** `/menu` — featured **Weekly Comfort Box** + line items; Square checkout via `/contact?intent=weekly-order`
- **Ordering window:** Automatic Fri 9 AM – Wed noon ET ([`lib/menu/schedule.ts`](../lib/menu/schedule.ts))
- **Direct URLs still work** (not redirected): `/gifts`, `/little-extras`

---

## Known limitations (Week 1)

1. **Gift Comfort Boxes** — not in nav, homepage gift section, contact gift intent, or closed-menu gift CTA. `/gifts` page still loads if bookmarked.
2. **Little Extras** — not in nav, TreatGrid, or menu callout. `/little-extras` still loads if bookmarked.
3. **Square webhooks** — Production Square checkout is configured; **paid-order confirmation emails via Resend are not active** until webhooks are set up. Confirm payments in the Square Dashboard. See [`docs/SQUARE_SETUP_TODO.md`](SQUARE_SETUP_TODO.md).
4. **Menu placeholders** — Item copy/prices in `currentMenu.ts` are placeholders until the baker updates them.

---

## How to revert (restore gifts + Little Extras)

### 1. Flip launch flags

In [`lib/content/launch.ts`](../lib/content/launch.ts):

```ts
export const launchConfig = {
  giftComfortBoxesEnabled: true,
  littleExtrasEnabled: true,
}
```

### 2. Re-enable menu Little Extras callout

In [`lib/content/currentMenu.ts`](../lib/content/currentMenu.ts):

```ts
littleExtrasCallout: {
  enabled: true,
  // ...existing text, button, href
},
```

### 3. Deploy

```bash
pnpm lint
pnpm build
# deploy to Vercel (or your host)
```

FAQ, nav, homepage, contact, and closed-state copy **restore automatically** from the flags. No need to manually revert Hero/Header/etc. unless you changed them outside this launch.

### 4. Optional follow-up

- Set up Square webhooks + `SQUARE_WEBHOOK_SIGNATURE_KEY` per [`docs/SQUARE_SETUP_TODO.md`](SQUARE_SETUP_TODO.md)
- Update `menuCycleId` each Friday in `currentMenu.ts`

---

## Smoke test before / after deploy

- [ ] Nav: **This Week**, **About**, **FAQ** only (no Comfort Boxes / Little Extras)
- [ ] `/menu`: Weekly Comfort Box featured; no Little Extras band
- [ ] `/contact`: Order This Week (when open), Menu Reminders, Ask a Question — **no** gift intent
- [ ] Homepage: no gift section; TreatGrid shows 2 cards
- [ ] Place test order through Square checkout (production or sandbox)

---

## Files touched (checklist)

- [x] `lib/content/launch.ts` (new)
- [x] `lib/contact/intents.ts` (new)
- [x] `docs/LAUNCH_WEEK1.md` (new)
- [x] `lib/content/currentMenu.ts`
- [x] `lib/content/availability.ts`
- [x] `lib/content/faq.ts` (removed static `homepageFaq`)
- [x] `components/layout/Header.tsx`
- [x] `components/layout/MobileNav.tsx`
- [x] `components/home/Hero.tsx`
- [x] `components/home/GiftSection.tsx`
- [x] `components/home/TreatGrid.tsx`
- [x] `components/home/FaqTeaser.tsx`
- [x] `components/menu/FeaturedProduct.tsx`
- [x] `components/menu/ClosedMenuCTA.tsx`
- [x] `components/contact/ContactPageContent.tsx`
- [x] `components/contact/ContactIntentSelector.tsx`
- [x] `app/api/inquiry/route.ts`
- [x] `app/faq/page.tsx`
