export interface FaqEntry {
  question: string
  answer: string
}

export const faqEntries: FaqEntry[] = [
  {
    question: "How do I order?",
    answer:
      "Just fill out our order inquiry form on the Contact page. Let us know what you're interested in, your preferred pickup date, and any details — and we'll get back to you to confirm everything.",
  },
  {
    question: "Where are you located?",
    answer:
      "The Nurtured Oven is a cottage bakery based in Central Kentucky. All treats are baked fresh in a home kitchen with love and care." /* confirm with owner — specific city/area */,
  },
  {
    question: "Do you offer local pickup?",
    answer:
      "Yes! Local pickup is available on Fridays and Saturdays. We'll confirm the details when you place your order." /* confirm with owner — pickup days/location */,
  },
  {
    question: "Do you offer local delivery?",
    answer:
      "We offer limited local delivery within about 15 miles. Reach out with your address and we'll let you know if delivery is available for your area." /* confirm with owner — radius */,
  },
  {
    question: "How much notice do you need?",
    answer:
      "Please allow at least 3–5 days lead time for all orders. For larger orders, gift boxes, or custom requests, a little extra notice is always appreciated." /* confirm with owner */,
  },
  {
    question: "Can I send a gift box to someone?",
    answer:
      "Absolutely! Gift boxes are one of our favorite things. Choose a Comfort Box or New Mom Gift Box, or request something custom. We'll package it with care and include a personal note if you'd like.",
  },
  {
    question: "Do I need to be a mom to order?",
    answer:
      "Not at all. The Nurtured Oven is mom-forward in its story and gifting, but the treats are for anyone who wants something homemade, familiar, and comforting. We bake for families, friends, coworkers, neighbors, and anyone who appreciates a really good cookie.",
  },
  {
    question: "Do you handle custom orders?",
    answer:
      "Yes — we're happy to work with you on custom assortments, larger quantities, or special requests. Just reach out through the order form and let us know what you have in mind.",
  },
  {
    question: "What about allergens?",
    answer:
      "The Nurtured Oven is a home kitchen. Our products may contain or come into contact with wheat, eggs, dairy, nuts, soy, and other common allergens. If you have specific concerns, please note them in your order and we'll do our best to accommodate.",
  },
  {
    question: "Are these lactation cookies?",
    answer:
      "Some treats may include oat-forward ingredients commonly associated with lactation-friendly recipes, but The Nurtured Oven is broader than that. These are comforting, small-batch sweets made for moms, families, gifting, and everyday nostalgia.",
  },
  {
    question: "What should I know about Kentucky cottage bakery rules?",
    answer:
      "As a Kentucky cottage bakery, The Nurtured Oven operates under state cottage food laws. Products are made in a home kitchen that is not inspected by the health department. This is noted on all packaging and is part of what makes cottage baking personal and community-centered.",
  },
]

export const homepageFaqSlugs = [
  "How do I order?",
  "Do you offer local pickup or delivery?",
  "Can I send a gift box to someone?",
]

export const homepageFaq: FaqEntry[] = [
  faqEntries[0],
  {
    question: "Do you offer local pickup or delivery?",
    answer:
      "Yes! Local pickup is available on Fridays and Saturdays, and we offer limited delivery within about 15 miles. We'll confirm all the details when you place your order.",
  },
  faqEntries[5],
]
