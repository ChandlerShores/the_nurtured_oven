import "server-only"

import { getCurrentMenu } from "@/lib/content/load-menu"
import type { CatalogItem } from "@/lib/order/catalog-types"
import {
  buildWeeklyCatalog,
} from "@/lib/order/catalog-build"

export type { CatalogItem } from "@/lib/order/catalog-types"
export { buildWeeklyCatalog, getWeeklyCatalogFallback } from "@/lib/order/catalog-build"

export async function getWeeklyCatalog(): Promise<CatalogItem[]> {
  const menu = await getCurrentMenu()
  return buildWeeklyCatalog(menu)
}

export async function getCatalogItem(
  slug: string
): Promise<CatalogItem | undefined> {
  const catalog = await getWeeklyCatalog()
  return catalog.find((item) => item.slug === slug)
}
