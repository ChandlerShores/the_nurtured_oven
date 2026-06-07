import { availability } from "@/lib/content/availability"
import type { FeaturedMenuProduct } from "@/lib/content/menu-types"

export interface HeroCopy {
  eyebrow: string
  headline: string
  body: string
}

export function buildHeroCopy(
  featured: FeaturedMenuProduct,
  orderingOpen: boolean,
  closedMessage: string
): HeroCopy {
  if (orderingOpen) {
    return {
      eyebrow: "fresh from the oven",
      headline: `${featured.name} are open for preorder.`,
      body: `${availability.openNote} ${featured.description}`,
    }
  }

  return {
    eyebrow: "this week's bake",
    headline: `${featured.name} — orders closed for this week.`,
    body: `${closedMessage} ${featured.description}`,
  }
}
