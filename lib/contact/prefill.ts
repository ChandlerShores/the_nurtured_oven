import { currentMenu } from "@/lib/content/currentMenu"
import { getCatalogItem, getWeeklyCatalog } from "@/lib/order/catalog"

export function resolvePrefillSlug(itemParam: string): string | undefined {
  if (!itemParam) return undefined
  const decoded = decodeURIComponent(itemParam.replace(/\+/g, " "))
  if (getCatalogItem(decoded)) return decoded
  const catalog = getWeeklyCatalog()
  const byName = catalog.find(
    (c) => c.name.toLowerCase() === decoded.toLowerCase()
  )
  if (byName) return byName.slug
  if (decoded.toLowerCase().includes("comfort box")) {
    return currentMenu.featured.slug
  }
  return undefined
}
