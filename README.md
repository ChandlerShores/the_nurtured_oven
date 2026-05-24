# The Nurtured Oven

Next.js 14 bakery site — weekly preorder menu, Square checkout, gift inquiries, and Little Extras.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test:e2e
```

Database (if using Prisma): `pnpm db:generate`, `pnpm db:push`, `pnpm db:seed`.

## Project structure

```
app/                    # Routes (menu, contact, gifts, API handlers)
  api/checkout/         # Weekly order → Square Payment Link
  api/webhooks/square/  # Payment confirmation emails
  api/inquiry/          # Gift / reminder / general inquiries
components/
  contact/              # Order & Contact UI (intent cards, forms)
  menu/                 # Weekly menu page sections
  order/                # Weekly cart
  home/, layout/, ui/
lib/
  content/              # Copy & data (currentMenu.ts = weekly menu updates)
  menu/                 # Ordering window schedule (ET)
  order/                # Catalog prices, delivery fee logic
  square/               # Square client & checkout creation
  contact/              # Contact form helpers
  email.ts              # Resend notifications
docs/                   # Business model & Square setup notes
public/images/          # Product & brand images
scripts/                # Dev utilities (e.g. ordering window test)
```

## Weekly menu updates

Edit **`lib/content/currentMenu.ts`** only — the menu page and checkout catalog read from there.

## Environment

Copy `.env.example` to `.env.local`. See `docs/SQUARE_SETUP_TODO.md` for Square and webhook setup.
