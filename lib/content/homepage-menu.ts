import type {
  CurrentMenu,
  FeaturedMenuProduct,
  MenuProduct,
} from "@/lib/content/menu-types"

export type HomepageDropItem = MenuProduct | FeaturedMenuProduct

/** First three cards on the homepage "weekly drop" grid (featured + supporting). */
export function getHomepageDropItems(menu: CurrentMenu): HomepageDropItem[] {
  return [menu.featured, ...menu.items].slice(0, 3)
}
