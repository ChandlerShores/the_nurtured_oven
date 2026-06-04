export const playbook = {
  headline: "Your weekly bakery, simplified.",
  tagline:
    "Small-batch comfort sweets, made weekly, boxed beautifully, and shared with care.",
  oneLiner:
    "You sell through a weekly preorder menu, a signature Comfort Box, gift tiers, seasonal drops, and Little Extras, with website ordering, Square payment, and a simple tracker keeping production manageable.",

  notThis: [
    "A fully custom bakery that says yes to everything",
    "An always-open catalog with unlimited SKUs",
    "Chaotic last-minute orders without payment confirmation",
  ],
  thisIs: [
    "A controlled Friday weekly rhythm: menu drops Friday, orders close Wednesday, fulfillment Friday",
    "3–5 items per week plus a hero Comfort Box",
    "Gift boxes built mostly from what you already bake",
    "Orders confirmed only after Square payment",
  ],

  products: [
    {
      name: "Weekly Menu",
      role: "Your sales engine",
      detail: "3–5 items, limited quantity, opens Friday, closes Wednesday at noon, fulfills Friday.",
      icon: "📋",
    },
    {
      name: "Weekly Comfort Box",
      role: "Your hero product",
      detail: "A curated mix of this week's sweets: easiest for customers, best for your average order value.",
      icon: "🎁",
      featured: true,
    },
    {
      name: "Gift Boxes",
      role: "Premium & emotional",
      detail: "Mini ($16–22), Classic ($32–42), Gathering ($55–75+). Mostly weekly menu items, beautifully packed.",
      icon: "💝",
    },
    {
      name: "Seasonal Drops",
      role: "Holiday revenue",
      detail: "Valentine's, Mother's Day, Thanksgiving, Christmas: announced early, capped, prepaid.",
      icon: "🍂",
    },
    {
      name: "Little Extras",
      role: "Bonus, not the brand",
      detail: "Leftover batches at $8–15, posted Fridays only. First paid, first claimed.",
      icon: "✨",
    },
  ],

  weekRhythm: [
    { day: "Friday", customer: "New menu drops; order window opens", you: "Post menu & open orders" },
    { day: "Sat through Wed noon", customer: "Order from this week's menu", you: "Prep & bake" },
    { day: "Wednesday", customer: "Order by noon (last call!)", you: "Close orders; plan production" },
    { day: "Thursday", customer: "Ordering closed", you: "Bake & pack" },
    { day: "Friday", customer: "Pickup / delivery", you: "Fulfill orders; Little Extras if any" },
  ],

  whenClosed: [
    "Sign up for menu reminders",
    "Request a future gift box",
    "Check for Little Extras on Friday",
  ],

  orderFlow: [
    "Customer orders on your website",
    "They get an automatic email with order summary",
    "They pay via Square at checkout on the website. Order confirmed once paid.",
    "You see it in your weekly tracker",
    "Friday: free pickup or Georgetown/Lexington delivery (fee varies by area; shown at checkout)",
  ],

  tools: [
    { name: "Website", job: "Brand, menu, forms, reminders when closed" },
    { name: "Square", job: "Payment & sales reporting" },
    { name: "Google Sheet / Airtable", job: "Bake counts, pickup list, gift messages, allergies" },
  ],

  pricingTargets: [
    { item: "Weekly Comfort Box", range: "$28–38", note: "Steer customers here" },
    { item: "Classic Comfort Box", range: "$32–42", note: "Main gift product" },
    { item: "6-pack cookies/bars", range: "$18–24", note: "Core weekly add-on" },
    { item: "Little Extras", range: "$8–15", note: "When available only" },
  ],
  pricingRule: "Ingredient + packaging should stay around 25–35% of sale price. Target average order: $25–40.",

  launchCapacity: "Start with 10–20 orders/week or 10–15 Comfort Boxes. Grow only when the rhythm still feels enjoyable.",

  marketingRhythm: [
    { day: "Friday", post: "Menu drop, fulfillment & Little Extras" },
    { day: "Monday", post: "Product spotlight" },
    { day: "Tuesday", post: "Gift / Comfort Box angle" },
    { day: "Wednesday AM", post: "Last call" },
    { day: "Thursday", post: "Behind the scenes" },
  ],

  coreCta:
    "Order by Wednesday at noon for free Friday pickup or Georgetown/Lexington delivery (fee shown at checkout).",

  phases: [
    { phase: "Phase 1", title: "Launch", items: "Homepage, weekly menu, order form, emails, Square, tracker, gift inquiry, Little Extras page" },
    { phase: "Phase 2", title: "First 4 menus", items: "Test rhythm: what sells, what stresses you, timing, pricing" },
    { phase: "Phase 3", title: "Gift push", items: "Photos, tiers, occasion messaging once weekly flow is smooth" },
    { phase: "Phase 4", title: "Seasonal drop", items: "First capped, prepaid holiday box" },
  ],

  goldenRules: [
    "Orders confirmed only after payment. Say it everywhere.",
    "The website never feels closed. Capture reminders & future gifts.",
    "Gift boxes use weekly menu items. Keep production simple.",
    "Little Extras are a bonus, not your promise",
    "Custom orders: availability only, with advance notice",
    "Products must earn their place on the menu",
  ],

  weeklyQuestions: [
    "Did baking feel manageable?",
    "Was packing rushed?",
    "Was delivery worth it?",
    "Did profit feel worth the time?",
    "What should leave next week's menu?",
  ],
}
