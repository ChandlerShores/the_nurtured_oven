export interface WeeklyMenuItem {
  name: string
  description: string
  allergenTags?: string[]
  priceLabel: string
  slug: string
}

export interface WeeklyMenu {
  weekLabel: string
  fulfillmentDate: string
  cutoffNote: string
  items: WeeklyMenuItem[]
  comfortBox: {
    name: string
    slug: string
    description: string
    priceLabel: string
    includes: string
    image: string
  }
}

export const weeklyMenu: WeeklyMenu = {
  weekLabel: "This Week's Menu",
  fulfillmentDate: "Friday pickup & limited local delivery",
  cutoffNote: "Order by Wednesday at noon — orders confirmed once payment is received via Square.",
  items: [
    {
      name: "Brown Butter Chocolate Chip Cookies",
      slug: "brown-butter-chocolate-chip-cookies",
      description: "Rich brown butter, dark chocolate, and a sprinkle of sea salt.",
      allergenTags: ["wheat", "eggs", "dairy"],
      priceLabel: "$18–24 / 6-pack",
    },
    {
      name: "Salted Caramel Brownies",
      slug: "salted-caramel-brownies",
      description: "Fudgy brownie swirled with homemade salted caramel.",
      allergenTags: ["wheat", "eggs", "dairy"],
      priceLabel: "$14–18 / 4-pack",
    },
    {
      name: "Biscoff Cloud Bars",
      slug: "biscoff-cloud-bars",
      description: "Crispy, gooey, and layered with Biscoff spread and marshmallow.",
      allergenTags: ["wheat", "dairy", "soy"],
      priceLabel: "$14–18 / 4-pack",
    },
  ],
  comfortBox: {
    name: "Weekly Comfort Box",
    slug: "weekly-comfort-box",
    description:
      "A curated mix of this week's best — cookies, bars, and a seasonal surprise, boxed and ready to enjoy or share.",
    priceLabel: "$28–38",
    includes: "An assortment of this week's bakes, beautifully boxed.",
    image: "/images/comfort-box.png",
  },
}
