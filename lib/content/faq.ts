export interface FaqEntry {
  question: string
  answer: string
}

export const faqEntries: FaqEntry[] = [
  {
    question: "How does weekly ordering work?",
    answer:
      "Every Friday we post a new weekly menu with 3\u20135 items plus the Weekly Comfort Box. Place your order by Wednesday at noon and pay at checkout to confirm. Orders are fulfilled on Friday via free pickup or local delivery in Georgetown and Lexington.",
  },
  {
    question: "What is the Weekly Comfort Box?",
    answer:
      "It\u2019s our signature product: a curated mix of this week\u2019s best bakes (cookies, bars, and a seasonal surprise), beautifully boxed and ready to enjoy or share. It\u2019s the easiest way to get a taste of everything we\u2019re baking.",
  },
  {
    question: "When is the ordering cutoff?",
    answer:
      "Wednesday at noon. Orders placed after the cutoff will be held for the following week. We cannot add items after the cutoff because ingredients are pre-planned.",
  },
  {
    question: "How do I pay?",
    answer:
      "Weekly orders are paid at checkout through Square. Your order is confirmed once payment is received. No payment, no confirmation.",
  },
  {
    question: "Do you offer local pickup?",
    answer:
      "Yes! Friday pickup is free. We\u2019ll confirm pickup details when your order is confirmed.",
  },
  {
    question: "Do you offer local delivery?",
    answer:
      "Free Friday pickup. Georgetown & Lexington delivery is $7, or free on orders $40+. We deliver during a set Friday window; exact times aren't guaranteed.",
  },
  {
    question: "What are the Comfort Box gift tiers?",
    answer:
      "We offer three sizes: Mini Comfort Box ($16\u201322), Classic Comfort Box ($32\u201342), and Gathering Box ($55\u201375+). Each is filled with an assortment of this week\u2019s bakes, beautifully packaged. You can include a personal gift message.",
  },
  {
    question: "What are Little Extras?",
    answer:
      "Sometimes there are leftover batches, test flavors, or beautifully imperfect pieces after a bake day. When available, we box them up at a friendly price ($8\u201315) and post them on Fridays. They\u2019re first-paid, first-claimed. Once they\u2019re gone, they\u2019re gone.",
  },
  {
    question: "What if ordering is closed when I visit the site?",
    answer:
      "You can sign up for menu reminders so you\u2019ll know the moment the next menu drops. You can also request a future gift box, ask about a custom order, or check if Little Extras are available on Friday.",
  },
  {
    question: "Do you take custom orders?",
    answer:
      "On a limited basis, with advance notice and based on availability. Custom work is not our primary offering, but we\u2019re happy to discuss it. Use the general contact form and let us know what you have in mind.",
  },
  {
    question: "Do I need to be a mom to order?",
    answer:
      "Not at all. The Nurtured Oven is mom-forward in its story and gifting, but the treats are for anyone who wants something homemade, familiar, and comforting. We bake for families, friends, coworkers, neighbors, and anyone who appreciates a really good cookie.",
  },
  {
    question: "What about allergens?",
    answer:
      "The Nurtured Oven is a home kitchen. Our products may contain or come into contact with wheat, eggs, dairy, nuts, soy, and other common allergens. If you have specific concerns, please note them in your order and we\u2019ll do our best to accommodate.",
  },
  {
    question: "What should I know about Kentucky cottage bakery rules?",
    answer:
      "As a Kentucky cottage bakery, The Nurtured Oven operates under state cottage food laws. Products are made in a home kitchen that is not inspected by the health department. This is noted on all packaging and is part of what makes cottage baking personal and community-centered.",
  },
]

export const homepageFaq: FaqEntry[] = [
  faqEntries[0],
  faqEntries[1],
  faqEntries[6],
]
