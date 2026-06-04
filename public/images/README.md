# Site Images

Audience: builders and content maintainers.

Owner photography, product images, and brand exports live here. The site references these filenames directly. Replacing a file with the same name is usually safer than changing code paths.

## Menu Images

Admin menu rows can use:

- `image_url`: full hosted URL or public path.
- `image_slug`: resolves to `/images/menu/{image_slug}.jpg`.
- Uploaded file from `/admin/menu`.

Local admin uploads write to `public/images/menu/`. Vercel uploads require `BLOB_READ_WRITE_TOKEN`; otherwise use a hosted image URL or commit the image file.

## Current Files

| File | Typical Use |
|---|---|
| `biscoff_cookie.png` | Cookie/category imagery |
| `biscoff-butter-cloud-bar.png` | Biscoff cloud bar product |
| `caramel-brownie.png` | Brownie product/category imagery |
| `chai-brownie.png` | Seasonal product imagery |
| `cinnamon_roll_hero.png` | Cinnamon roll feature imagery |
| `cloud-bar-in-package.png` | Gift/category imagery |
| `cloudbar_stretch.png` | Cloud bar detail imagery |
| `founder_family.png` | About/founder imagery |
| `marshmallow-cloud-bar.png` | Marshmallow cloud bar product |
| `nurtured-oven-flowers-logo.png` | Brand mark |
| `nurtured-oven-flowers-logo-cream.png` | Cream brand mark variant |
| `nurtured-oven-flowers-logo-transparent.png` | Transparent brand mark variant |
| `nurtured-oven-full-logo.png` | Full logo |
| `nurtured-oven-script-logo.png` | Script logo |
| `oatmeal_cookie_spring.png` | Oatmeal cookie product |
| `oatmeal_cookie_tulips.png` | Oatmeal/tulip lifestyle image |
| `oatmeal-cookie.png` | Oatmeal cookie image |
| `rustic_bread_hero.png` | Homepage/hero image |
| `seasonal-feature.png` | Seasonal CTA/background image |
| `sour-dough-loaf.png` | Spare/social image |
| `tulip_gift_box.png` | Gift box imagery |
| `vanilla-bean-buttercream.png` | Future product/section image |
| `weekly_comfort_box.png` | Weekly Comfort Box imagery |

## Replacement Rules

1. Prefer keeping filenames stable.
2. Use warm natural-light food photography.
3. Hero images should be wide enough for text overlays.
4. Product/category images should crop cleanly at square and 4:3 ratios.
5. Avoid committing very large source exports; keep production images web-ready.

When changing filenames, check references in `components/`, `app/`, and `lib/content/`.
