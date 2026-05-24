export interface GiftBox {
  name: string
  slug: string
  tier: "mini" | "classic" | "gathering"
  description: string
  longDescription: string
  image: string
  imageClassName?: string
  priceLabel: string
  occasions: string[]
}

export const giftBoxes: GiftBox[] = [
  {
    name: "Mini Comfort Box",
    slug: "mini-comfort-box",
    tier: "mini",
    description: "A small but thoughtful box of fresh-baked comfort.",
    longDescription:
      "The perfect little pick-me-up. A curated selection of this week's treats, beautifully packaged and ready to brighten someone's day — or your own.",
    image: "/images/cloud-bar-in-package.png",
    priceLabel: "$16–22",
    occasions: [
      "Thinking of you",
      "Teacher gifts",
      "Just because",
      "Everyday comfort",
    ],
  },
  {
    name: "Classic Comfort Box",
    slug: "classic-comfort-box",
    tier: "classic",
    description: "Our most popular gift — a generous box of fresh-baked favorites.",
    longDescription:
      "The Classic Comfort Box is made for the moments that matter. Filled with a generous assortment of this week's cookies, bars, and seasonal treats, it's the kind of gift that says 'I see you, and you're doing an amazing job.'",
    image: "/images/weekly_comfort_box.png",
    imageClassName: "scale-[1.15]",
    priceLabel: "$32–42",
    occasions: [
      "New moms",
      "Meal trains",
      "Birthdays",
      "Thank-you gifts",
      "Hard weeks",
    ],
  },
  {
    name: "Gathering Box",
    slug: "gathering-box",
    tier: "gathering",
    description: "Comfort at scale — a generous spread for groups, gatherings, and celebrations.",
    longDescription:
      "Hosting, celebrating, or feeding a crowd? The Gathering Box is a beautifully arranged assortment of our best bakes, designed to share around a table, at an office, or anywhere people come together.",
    image: "/images/cloudbar_stretch.png",
    priceLabel: "$55–75+",
    occasions: [
      "Office gifts",
      "Holiday gatherings",
      "Celebrations",
      "Team appreciation",
      "Hostess gifts",
    ],
  },
]

export const giftingMoments = [
  "New moms",
  "Meal trains",
  "Thank-you gifts",
  "Birthdays",
  "Hard weeks",
  "Everyday comfort",
  "Team appreciation",
]
