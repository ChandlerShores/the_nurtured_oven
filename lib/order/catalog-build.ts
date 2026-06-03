import { fallbackCurrentMenu } from "@/lib/content/currentMenu"
import type { CurrentMenu } from "@/lib/content/menu-types"
import type { CatalogItem } from "@/lib/order/catalog-types"

export function buildWeeklyCatalog(menu: CurrentMenu): CatalogItem[] {
  const items: CatalogItem[] = menu.items.map((item) => ({
    slug: item.slug,
    name: item.name,
    priceCents: item.priceCents,
    unitLabel: item.unitLabel,
    image: item.image,
    category: item.roleLabel,
  }))

  items.push({
    slug: menu.featured.slug,
    name: menu.featured.name,
    priceCents: menu.featured.priceCents,
    unitLabel: menu.featured.unitLabel,
    image: menu.featured.image,
    category: menu.featured.featuredEyebrow ?? menu.featured.roleLabel,
  })

  return items
}

export function getWeeklyCatalogFallback(): CatalogItem[] {
  return buildWeeklyCatalog(fallbackCurrentMenu)
}
