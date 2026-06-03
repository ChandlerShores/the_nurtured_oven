import { resolveMenuImage } from "@/lib/content/menu-from-sheet"
import { buildCurrentMenuFromSheetRows } from "@/lib/content/menu-from-sheet"
import type { CurrentMenu } from "@/lib/content/menu-types"
import { activeMenuRows } from "@/lib/google-sheets/menu-parse"
import type { MenuSheetRowWithIndex } from "@/lib/google-sheets/menu-admin"

export interface AdminMenuItemView {
  sheetRow: number
  slug: string
  name: string
  description: string
  priceCents: number
  priceLabel: string
  active: boolean
  featured: boolean
  category: string
  sortOrder: number
  imageSlug: string
  imageUrl: string
  allergens: string
  notes: string
  image: string
}

function formatPriceLabel(cents: number, notes: string): string {
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)
  return notes.trim() ? `$${dollars} / ${notes.trim()}` : `$${dollars}`
}

export function toAdminMenuItemView(row: MenuSheetRowWithIndex): AdminMenuItemView {
  return {
    sheetRow: row.sheetRow,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    priceLabel: formatPriceLabel(row.priceCents, row.notes),
    active: row.active,
    featured: row.featured,
    category: row.category,
    sortOrder: row.sortOrder,
    imageSlug: row.imageSlug,
    imageUrl: row.imageUrl,
    allergens: row.allergens.join(", "),
    notes: row.notes,
    image: resolveMenuImage(row.imageUrl, row.imageSlug, row.slug),
  }
}

export function buildPreviewMenu(rows: MenuSheetRowWithIndex[]): CurrentMenu | null {
  return buildCurrentMenuFromSheetRows(activeMenuRows(rows))
}

function adminItemToSheetRow(item: AdminMenuItemView): MenuSheetRowWithIndex {
  return {
    sheetRow: item.sheetRow,
    slug: item.slug,
    name: item.name,
    description: item.description,
    priceCents: item.priceCents,
    active: item.active,
    featured: item.featured,
    category: item.category,
    sortOrder: item.sortOrder,
    imageSlug: item.imageSlug,
    imageUrl: item.imageUrl,
    allergens: item.allergens
      .split(/[,;]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    notes: item.notes,
  }
}

/** Customer preview from admin UI local state (no Sheets round-trip). */
export function buildPreviewMenuFromAdminItems(
  items: AdminMenuItemView[]
): CurrentMenu | null {
  return buildCurrentMenuFromSheetRows(
    activeMenuRows(items.map(adminItemToSheetRow))
  )
}

/** When one item is featured, clear featured on all others in local state. */
export function applyFeaturedToItems(
  items: AdminMenuItemView[],
  featuredSlug: string
): AdminMenuItemView[] {
  return items.map((item) => {
    if (item.slug === featuredSlug) {
      return { ...item, featured: true, active: true }
    }
    if (item.featured) {
      return { ...item, featured: false }
    }
    return item
  })
}

export interface AdminMenuPatchPayload {
  sheetRow: number
  slug: string
  name: string
  description: string
  price: string
  active: boolean
  featured: boolean
  category: string
  sortOrder: number
  imageSlug: string
  imageUrl: string
  allergens: string
  notes: string
}

export function adminItemToPatchPayload(
  item: AdminMenuItemView
): AdminMenuPatchPayload {
  return {
    sheetRow: item.sheetRow,
    slug: item.slug,
    name: item.name,
    description: item.description,
    price: (item.priceCents / 100).toFixed(item.priceCents % 100 === 0 ? 0 : 2),
    active: item.active,
    featured: item.featured,
    category: item.category,
    sortOrder: item.sortOrder,
    imageSlug: item.imageSlug,
    imageUrl: item.imageUrl,
    allergens: item.allergens,
    notes: item.notes,
  }
}
