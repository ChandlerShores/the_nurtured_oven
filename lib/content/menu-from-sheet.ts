import type { MenuSheetRow } from "@/lib/google-sheets/menu-parse"
import type {
  CurrentMenu,
  FeaturedMenuProduct,
  MenuProduct,
} from "@/lib/content/menu-types"
import { fallbackCurrentMenu } from "@/lib/content/currentMenu"

function formatPriceLabel(priceCents: number, unitLabel?: string): string {
  const dollars = (priceCents / 100).toFixed(priceCents % 100 === 0 ? 0 : 2)
  return unitLabel ? `$${dollars} / ${unitLabel}` : `$${dollars}`
}

export function resolveMenuImage(
  imageUrl: string,
  imageSlug: string,
  slug: string
): string {
  if (imageUrl.trim()) return imageUrl.trim()
  const slugPath = imageSlug.trim() || slug.trim()
  if (slugPath) return `/images/menu/${slugPath}.jpg`
  return fallbackCurrentMenu.featured.image
}

function sheetRowToProduct(
  row: MenuSheetRow,
  featured: boolean
): MenuProduct | FeaturedMenuProduct {
  const unitLabel = row.notes || undefined
  const image = resolveMenuImage(row.imageUrl, row.imageSlug, row.slug)
  const base: MenuProduct = {
    slug: row.slug,
    name: row.name,
    description: row.description,
    roleLabel: row.category || undefined,
    priceLabel: formatPriceLabel(row.priceCents, unitLabel),
    priceCents: row.priceCents,
    unitLabel,
    allergenTags: row.allergens,
    image,
    squareCheckoutUrl: "",
    orderButtonText: `Order ${row.name}`,
    soldOut: false,
    limitedQuantity: false,
    limitedQuantityNote: row.notes || undefined,
  }

  if (featured) {
    return {
      ...base,
      featuredEyebrow: row.category || "This Week's Feature",
      image,
    }
  }

  return base
}

export function buildCurrentMenuFromSheetRows(
  rows: MenuSheetRow[],
  shell: CurrentMenu = fallbackCurrentMenu
): CurrentMenu | null {
  const active = rows
    .filter((row) => row.active && row.slug && row.name)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (active.length === 0) return null

  let featuredRow = active.find((row) => row.featured)
  let itemRows = active.filter((row) => !row.featured)

  if (!featuredRow) {
    featuredRow = active[0]
    itemRows = active.slice(1)
  } else {
    itemRows = active.filter((row) => row.slug !== featuredRow!.slug)
  }

  const featured = sheetRowToProduct(
    featuredRow,
    true
  ) as FeaturedMenuProduct

  const items = itemRows.map((row) => sheetRowToProduct(row, false))

  return {
    ...shell,
    featured,
    items,
  }
}
