import { currentMenu } from "@/lib/content/currentMenu"

export interface CatalogItem {
  slug: string
  name: string
  priceCents: number
  unitLabel?: string
  image?: string
}

export function getWeeklyCatalog(): CatalogItem[] {
  const items: CatalogItem[] = currentMenu.items.map((item) => ({
    slug: item.slug,
    name: item.name,
    priceCents: item.priceCents,
    unitLabel: item.unitLabel,
    image: item.image,
  }))

  items.push({
    slug: currentMenu.featured.slug,
    name: currentMenu.featured.name,
    priceCents: currentMenu.featured.priceCents,
    unitLabel: currentMenu.featured.unitLabel,
    image: currentMenu.featured.image,
  })

  return items
}

export function getCatalogItem(slug: string): CatalogItem | undefined {
  return getWeeklyCatalog().find((item) => item.slug === slug)
}
