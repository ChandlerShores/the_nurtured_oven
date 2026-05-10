export interface MenuItem {
  name: string
  description: string
  allergenTags?: string[]
  price?: string
  slug: string
}

export interface MenuCategory {
  name: string
  slug: string
  description: string
  image: string
  items: MenuItem[]
}

export const menuCategories: MenuCategory[] = [
  {
    name: "Cookies",
    slug: "cookies",
    description: "Classic, comforting, and made from scratch. Every batch is small and baked with care.",
    image: "/images/biscoff_cookie.png",
    items: [
      {
        name: "Brown Butter Chocolate Chip",
        slug: "brown-butter-chocolate-chip",
        description: "Rich brown butter, dark chocolate, and a sprinkle of sea salt.",
        allergenTags: ["wheat", "eggs", "dairy"],
        price: "Confirm with owner" /* confirm with owner */,
      },
      {
        name: "Oatmeal Raisin",
        slug: "oatmeal-raisin",
        description: "Old-fashioned oats, plump raisins, warm cinnamon, and a soft chewy center.",
        allergenTags: ["wheat", "eggs", "dairy"],
        price: "Confirm with owner" /* confirm with owner */,
      },
      {
        name: "Snickerdoodle",
        slug: "snickerdoodle",
        description: "Buttery, soft, and rolled in cinnamon sugar. A nostalgic favorite.",
        allergenTags: ["wheat", "eggs", "dairy"],
        price: "Confirm with owner" /* confirm with owner */,
      },
      {
        name: "Peanut Butter",
        slug: "peanut-butter",
        description: "Thick, crumbly, and packed with real peanut butter flavor.",
        allergenTags: ["wheat", "eggs", "dairy", "peanuts"],
        price: "Confirm with owner" /* confirm with owner */,
      },
    ],
  },
  {
    name: "Bars",
    slug: "bars",
    description: "Thick, layered, and perfect for sharing. Bars that feel like a warm hug.",
    image: "/images/treat-bars.jpg",
    items: [
      {
        name: "Lemon Bars",
        slug: "lemon-bars",
        description: "Bright lemon curd over a buttery shortbread crust, dusted with powdered sugar.",
        allergenTags: ["wheat", "eggs", "dairy"],
        price: "Confirm with owner" /* confirm with owner */,
      },
      {
        name: "Oat Crumble Bars",
        slug: "oat-crumble-bars",
        description: "Buttery oat crust with a seasonal fruit filling and golden crumble topping.",
        allergenTags: ["wheat", "eggs", "dairy"],
        price: "Confirm with owner" /* confirm with owner */,
      },
    ],
  },
  {
    name: "Brownies",
    slug: "brownies",
    description: "Dense, fudgy, and unapologetically chocolatey. Made for serious chocolate lovers.",
    image: "/images/treat-brownies.jpg",
    items: [
      {
        name: "Classic Fudge Brownie",
        slug: "classic-fudge-brownie",
        description: "Rich, dense, and deeply chocolatey with a crackly top.",
        allergenTags: ["wheat", "eggs", "dairy"],
        price: "Confirm with owner" /* confirm with owner */,
      },
      {
        name: "Salted Caramel Brownie",
        slug: "salted-caramel-brownie",
        description: "Fudgy brownie swirled with homemade salted caramel.",
        allergenTags: ["wheat", "eggs", "dairy"],
        price: "Confirm with owner" /* confirm with owner */,
      },
    ],
  },
  {
    name: "Seasonal Treats",
    slug: "seasonal",
    description: "Limited-time flavors inspired by the season. Follow along on Instagram to see what's baking.",
    image: "/images/treat-seasonal.jpg",
    items: [
      {
        name: "Seasonal Flavor",
        slug: "seasonal-flavor",
        description: "Check Instagram or reach out for the current seasonal menu." /* confirm with owner */,
        price: "Varies",
      },
    ],
  },
  {
    name: "Gift Boxes",
    slug: "gift-boxes",
    description: "A curated box of treats, wrapped with care and ready to brighten someone's day.",
    image: "/images/treat-gift-boxes.jpg",
    items: [
      {
        name: "The Classic Gift Box",
        slug: "classic-gift-box",
        description: "An assortment of our most-loved cookies and bars, beautifully packaged.",
        price: "Confirm with owner" /* confirm with owner */,
      },
      {
        name: "Custom Gift Box",
        slug: "custom-gift-box",
        description: "Choose your favorites — we'll put it together for you.",
        price: "Confirm with owner" /* confirm with owner */,
      },
    ],
  },
  {
    name: "Comfort Boxes",
    slug: "comfort-boxes",
    description: "A little something for a hard week, a new chapter, or just because. Comfort, delivered.",
    image: "/images/treat-comfort-boxes.jpg",
    items: [
      {
        name: "The Comfort Box",
        slug: "comfort-box",
        description: "A thoughtful mix of fresh-baked treats to lift someone's spirits.",
        price: "Confirm with owner" /* confirm with owner */,
      },
      {
        name: "New Mom Comfort Box",
        slug: "new-mom-comfort-box",
        description: "A warm care package for the early days of motherhood.",
        price: "Confirm with owner" /* confirm with owner */,
      },
    ],
  },
]
