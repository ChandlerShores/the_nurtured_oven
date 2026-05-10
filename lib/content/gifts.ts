export interface GiftBox {
  name: string
  slug: string
  description: string
  longDescription: string
  image: string
  startingPrice?: string
  occasions: string[]
}

export const giftBoxes: GiftBox[] = [
  {
    name: "Comfort Box",
    slug: "comfort-box",
    description: "A warm care package of fresh-baked treats for someone who needs a little comfort.",
    longDescription:
      "Sometimes the best thing you can send is something homemade. The Comfort Box is a curated collection of our most-loved cookies and bars, packed with care and ready to brighten a hard day, a long week, or a season that needs a little sweetness.",
    image: "/images/treat-comfort-boxes.jpg",
    startingPrice: "Confirm with owner" /* confirm with owner */,
    occasions: [
      "Hard weeks",
      "Thank-you gifts",
      "Birthdays",
      "Thinking of you",
      "Everyday comfort",
    ],
  },
  {
    name: "New Mom Gift Box",
    slug: "new-mom-gift-box",
    description: "A thoughtful gift for the earliest, hardest, most beautiful days of motherhood.",
    longDescription:
      "The New Mom Gift Box is made for the mom who's pouring into everyone else. Filled with comforting, homemade treats and wrapped with intention, it's the kind of care package that says 'I see you, and you're doing an amazing job.'",
    image: "/images/gift-box-flatlay.jpg",
    startingPrice: "Confirm with owner" /* confirm with owner */,
    occasions: [
      "New baby",
      "Meal trains",
      "Postpartum care",
      "Baby shower gift",
      "Just because",
    ],
  },
  {
    name: "Custom Gift Request",
    slug: "custom-gift-request",
    description: "Tell us who it's for and we'll make something just right.",
    longDescription:
      "Have something specific in mind? Whether it's a meal-train add-on, an office thank-you, or a custom assortment for a friend going through it — send us a message and we'll work with you to put together the perfect box.",
    image: "/images/gift-section.jpg",
    occasions: [
      "Meal trains",
      "Office gifts",
      "Custom occasions",
      "Holidays",
      "Corporate gifting",
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
]
