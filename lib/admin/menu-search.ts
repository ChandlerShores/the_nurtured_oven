import type { AdminMenuItemView } from "@/lib/admin/menu-present"

export type MenuSearchScope = "all" | "active" | "hidden"

function searchHaystack(item: AdminMenuItemView): string {
  return [
    item.name,
    item.slug,
    item.description,
    item.category,
    item.allergens,
    item.notes,
    item.priceLabel,
    item.soldOut ? "sold out sold-out" : "",
    item.featured ? "featured" : "",
    item.active ? "active visible" : "hidden inactive",
  ]
    .join(" ")
    .toLowerCase()
}

export function menuItemMatchesSearch(
  item: AdminMenuItemView,
  query: string
): boolean {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return true

  const haystack = searchHaystack(item)
  const tokens = trimmed.split(/\s+/).filter(Boolean)
  return tokens.every((token) => haystack.includes(token))
}

export function filterMenuItemsBySearch(
  items: AdminMenuItemView[],
  query: string,
  scope: MenuSearchScope = "all"
): AdminMenuItemView[] {
  let pool = items
  if (scope === "active") pool = pool.filter((item) => item.active)
  if (scope === "hidden") pool = pool.filter((item) => !item.active)

  const trimmed = query.trim()
  if (!trimmed) return pool

  return pool.filter((item) => menuItemMatchesSearch(item, trimmed))
}
