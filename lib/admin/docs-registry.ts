export type AdminDocCategory =
  | "start"
  | "weekly"
  | "bake-day"
  | "updates"
  | "emergency"
  | "training"

export interface AdminDocEntry {
  slug: string
  title: string
  description: string
  whenToUse: string
  category: AdminDocCategory
  markdownPath: string
}

export const adminDocCategories: {
  id: AdminDocCategory
  title: string
  description: string
}[] = [
  {
    id: "start",
    title: "Start here",
    description: "A gentle overview of what the bakery portal helps with.",
  },
  {
    id: "weekly",
    title: "Weekly workflow",
    description: "Menu updates, ordering controls, and weekly rhythm.",
  },
  {
    id: "bake-day",
    title: "Bake day",
    description: "Paid orders, pickup, and delivery day guides.",
  },
  {
    id: "updates",
    title: "Customer updates",
    description: "Simple help for sending short customer notes.",
  },
  {
    id: "emergency",
    title: "Emergency help",
    description: "What to do first when something feels wrong.",
  },
  {
    id: "training",
    title: "Training",
    description: "A simple plan for learning the portal step by step.",
  },
]

export const adminDocs: AdminDocEntry[] = [
  {
    slug: "welcome-guide",
    title: "Welcome guide",
    description: "A calm first look at what the bakery portal is for.",
    whenToUse: "Start here before learning the weekly workflow.",
    category: "start",
    markdownPath: "docs/sops/baker/welcome-guide.md",
  },
  {
    slug: "weekly-checklist",
    title: "Weekly checklist",
    description: "A one-page rhythm for running a normal bakery week.",
    whenToUse: "Use this at the start of each week.",
    category: "weekly",
    markdownPath: "docs/sops/baker/weekly-checklist.md",
  },
  {
    slug: "update-weekly-menu",
    title: "Update this week's menu",
    description: "Update the items customers can see and order.",
    whenToUse: "Use this before opening orders for a new menu drop.",
    category: "weekly",
    markdownPath: "docs/sops/baker/update-weekly-menu.md",
  },
  {
    slug: "open-close-ordering",
    title: "Open or close ordering",
    description: "Open ordering when ready, or pause orders when unsure.",
    whenToUse: "Use this before a menu drop or anytime ordering should pause.",
    category: "weekly",
    markdownPath: "docs/sops/baker/open-close-ordering.md",
  },
  {
    slug: "bake-day-checklist",
    title: "Bake day checklist",
    description: "A quick list for pickup and delivery day.",
    whenToUse: "Use this on fulfillment day.",
    category: "bake-day",
    markdownPath: "docs/sops/baker/bake-day-checklist.md",
  },
  {
    slug: "review-paid-orders",
    title: "Review paid orders",
    description: "Check what customers have already paid for.",
    whenToUse: "Use this before baking, packing, pickup, or delivery.",
    category: "bake-day",
    markdownPath: "docs/sops/baker/review-paid-orders.md",
  },
  {
    slug: "pickup-orders",
    title: "Manage pickup orders",
    description: "Work through pickup orders and mark handoffs complete.",
    whenToUse: "Use this when pickup orders are packed or being collected.",
    category: "bake-day",
    markdownPath: "docs/sops/baker/pickup-orders.md",
  },
  {
    slug: "delivery-orders",
    title: "Manage delivery orders",
    description: "Check addresses, plan the delivery path, and mark drop-offs.",
    whenToUse: "Use this before and during deliveries.",
    category: "bake-day",
    markdownPath: "docs/sops/baker/delivery-orders.md",
  },
  {
    slug: "customer-updates",
    title: "Send customer updates",
    description: "Send short updates for pickup, delivery, or a personal note.",
    whenToUse: "Use this when a customer needs a clear update.",
    category: "updates",
    markdownPath: "docs/sops/baker/customer-updates.md",
  },
  {
    slug: "emergency-guide",
    title: "Emergency guide",
    description: "A calm first response when something feels wrong.",
    whenToUse: "Use this when you are unsure what to do next.",
    category: "emergency",
    markdownPath: "docs/sops/baker/emergency-guide.md",
  },
  {
    slug: "training-plan",
    title: "Training plan",
    description: "A three-session plan for learning the portal.",
    whenToUse: "Use this when Chandler and Kori practice together.",
    category: "training",
    markdownPath: "docs/sops/baker/training-plan.md",
  },
]

export function findAdminDoc(slug: string): AdminDocEntry | undefined {
  return adminDocs.find((doc) => doc.slug === slug)
}
