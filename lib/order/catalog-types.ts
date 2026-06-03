export interface CatalogItem {
  slug: string
  name: string
  priceCents: number
  unitLabel?: string
  image?: string
  /** Baker-facing category (from menu roleLabel or featured eyebrow). */
  category?: string
}
