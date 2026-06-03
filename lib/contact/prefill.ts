import type { CatalogItem } from "@/lib/order/catalog-types"
import type { CurrentMenu } from "@/lib/content/menu-types"

export function resolvePrefillSlugFromCatalog(
  itemParam: string,
  catalog: CatalogItem[],
  featuredSlug: string
): string | undefined {
  if (!itemParam) return undefined
  const decoded = decodeURIComponent(itemParam.replace(/\+/g, " "))
  if (catalog.some((c) => c.slug === decoded)) return decoded
  const byName = catalog.find(
    (c) => c.name.toLowerCase() === decoded.toLowerCase()
  )
  if (byName) return byName.slug
  if (decoded.toLowerCase().includes("comfort box")) {
    return featuredSlug
  }
  return undefined
}

export async function resolvePrefillSlug(
  itemParam: string | undefined,
  menu: CurrentMenu,
  catalog: CatalogItem[]
): Promise<string | undefined> {
  return resolvePrefillSlugFromCatalog(
    itemParam ?? "",
    catalog,
    menu.featured.slug
  )
}
