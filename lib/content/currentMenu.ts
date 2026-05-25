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
  menuCycleId: undefined,
  cutoffText:
    "Order by Wednesday at noon. Pay at checkout to confirm your order.",
  fulfillmentText:
    "Friday pickup (free) or local delivery in Georgetown & Lexington ($7, free on orders $40+)",

  announcementBarText: undefined,

  itemsSectionTitle: "Also available this week",

  featured: {
    slug: "weekly-comfort-box",
    name: "Weekly Comfort Box",
    description:
      "A curated mix of this week's best: cookies, bars, and a seasonal surprise, boxed and ready to enjoy or share.",
    includes: "An assortment of this week's bakes, beautifully boxed.",
    priceLabel: "$33",
    priceCents: 3300,
    allergenTags: ["wheat", "eggs", "dairy", "soy"],
    image: "/images/weekly_comfort_box.png",
    squareCheckoutUrl: "",
    orderButtonText: "Order a Comfort Box",
    soldOut: false,
    limitedQuantity: false,
  },

  items: [
    {
      slug: "brown-butter-chocolate-chip-cookies",
      name: "Brown Butter Chocolate Chip Cookies",
      description:
        "Rich brown butter, dark chocolate, and a sprinkle of sea salt.",
      priceLabel: "$21 / 6-pack",
      priceCents: 2100,
      unitLabel: "6-pack",
      allergenTags: ["wheat", "eggs", "dairy"],
      squareCheckoutUrl: "",
      orderButtonText: "Order cookies",
      soldOut: false,
      limitedQuantity: false,
    },
    {
      slug: "salted-caramel-brownies",
      name: "Salted Caramel Brownies",
      description: "Fudgy brownie swirled with homemade salted caramel.",
      priceLabel: "$16 / 4-pack",
      priceCents: 1600,
      unitLabel: "4-pack",
      allergenTags: ["wheat", "eggs", "dairy"],
      squareCheckoutUrl: "",
      orderButtonText: "Order brownies",
      soldOut: false,
      limitedQuantity: false,
    },
    {
      slug: "biscoff-cloud-bars",
      name: "Biscoff Cloud Bars",
      description:
        "Crispy, gooey, and layered with Biscoff spread and marshmallow.",
      priceLabel: "$16 / 4-pack",
      priceCents: 1600,
      unitLabel: "4-pack",
      allergenTags: ["wheat", "dairy", "soy"],
      squareCheckoutUrl: "",
      orderButtonText: "Order bars",
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
    enabled: true,
    text: "Sometimes we have leftover batches on Fridays. First paid, first claimed.",
    buttonText: "See Little Extras",
    href: "/little-extras",
  },
}
