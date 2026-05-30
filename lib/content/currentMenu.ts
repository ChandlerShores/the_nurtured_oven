/**
 * WEEKLY MENU UPDATES - edit this file only
 * -----------------------------------------
 * Each week:
 * 1. Update Square products, inventory, and payment/checkout links.
 * 2. Paste the new menu details below (items, prices, links, sold-out flags).
 * 3. Preview the site (`pnpm dev` → /menu).
 * 4. Deploy.
 *
 * Do not edit `app/menu/page.tsx` or menu layout components for routine updates.
 *
 * Ordering open/closed is automatic (America/New_York):
 * - Open: Friday 9:00 AM → Wednesday 12:00 PM (noon)
 * - Closed: Wednesday 12:01 PM → next Friday 9:00 AM
 */

import type { CurrentMenu } from "@/lib/content/menu-types"

export const currentMenu: CurrentMenu = {
  weekLabel: "This Week's Menu",
  /** Set each week for Square metadata / order emails (e.g. menu open date). */
  menuCycleId: "2026-05-30",
  cutoffText:
    "Preorder by Wednesday at noon for Friday pickup or delivery.",
  fulfillmentText:
    "Friday pickup (free) or local delivery in Georgetown & Lexington ($7, free on orders $40+)",

  announcementBarText: undefined,

  itemsSectionTitle: "More from this week's menu",

  featured: {
    slug: "cinnamon-rolls",
    name: "Cinnamon Rolls",
    featuredEyebrow: "This Week's Feature",
    description:
      "Soft, cozy cinnamon rolls finished with homemade frosting. Available this week by preorder for Friday pickup or delivery.",
    priceLabel: "$21 / 4-pack",
    priceCents: 2100,
    unitLabel: "4-pack",
    allergenTags: ["wheat", "eggs", "dairy"],
    image: "/images/cinnamon_roll_hero.png",
    squareCheckoutUrl: "",
    orderButtonText: "Order Cinnamon Rolls",
    soldOut: false,
    limitedQuantity: false,
  },

  items: [
    {
      slug: "oatmeal-cookie",
      name: "Oatmeal Cookie",
      roleLabel: "Signature Staple",
      description:
        "A cozy small-batch favorite with familiar, homemade comfort in every bite.",
      priceLabel: "$18 / 6-pack",
      priceCents: 1800,
      unitLabel: "6-pack",
      allergenTags: ["wheat", "eggs", "dairy"],
      image: "/images/oatmeal_cookie_spring.png",
      squareCheckoutUrl: "",
      orderButtonText: "Order Oatmeal Cookies",
      soldOut: false,
      limitedQuantity: false,
    },
    {
      slug: "marshmallow-cloud-bar",
      name: "Marshmallow Cloud Bar",
      roleLabel: "Special Treat",
      description:
        "A soft, dreamy treat with a nostalgic, cloud-like sweetness.",
      priceLabel: "$16 / 4-pack",
      priceCents: 1600,
      unitLabel: "4-pack",
      allergenTags: ["wheat", "dairy", "soy"],
      image: "/images/marshmallow-cloud-bar.png",
      squareCheckoutUrl: "",
      orderButtonText: "Order Cloud Bars",
      soldOut: false,
      limitedQuantity: false,
    },
  ],

  orderCta: {
    heading: "Ready to order?",
    openBody:
      "Place your order by Wednesday at noon and pay at checkout to confirm. Pickup is free; Georgetown & Lexington delivery is $7 (free on orders $40+).",
    openButtonText: "Place My Order",
    squareCheckoutUrl: "",
  },

  littleExtrasCallout: {
    enabled: false,
    text: "Sometimes we have leftover batches on Fridays. First paid, first claimed.",
    buttonText: "See Little Extras",
    href: "/little-extras",
  },
}
