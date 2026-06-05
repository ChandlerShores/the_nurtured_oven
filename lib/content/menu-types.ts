export interface MenuProduct {
  slug: string
  name: string
  description: string
  /** Short curated label shown above the name (e.g. "Signature Staple", "Special Treat"). */
  roleLabel?: string
  priceLabel: string
  /** Used by on-site Square checkout (`/contact` cart). Keep in sync with Square. */
  priceCents: number
  unitLabel?: string
  allergenTags: string[]
  image?: string
  /** Paste the Square payment/checkout link for this item (leave empty to use site checkout). */
  squareCheckoutUrl?: string
  orderButtonText?: string
  soldOut?: boolean
  limitedQuantity?: boolean
  limitedQuantityNote?: string
}

export interface FeaturedMenuProduct extends MenuProduct {
  /** Eyebrow above the featured item (defaults to "This Week's Feature"). */
  featuredEyebrow?: string
  includes?: string
  image: string
}

export interface MenuOrderCta {
  heading: string
  openBody: string
  openButtonText: string
  /** Optional Square link for “order everything” (e.g. multi-item payment link). */
  squareCheckoutUrl?: string
}

export interface CurrentMenu {
  weekLabel: string
  /**
   * Optional baker-defined batch id for Square metadata and emails (e.g. "2026-05-24").
   * Update each week when you rotate the menu.
   */
  menuCycleId?: string
  cutoffText: string
  fulfillmentText: string
  announcementBarText?: string
  itemsSectionTitle: string
  featured: FeaturedMenuProduct
  items: MenuProduct[]
  orderCta: MenuOrderCta
}
