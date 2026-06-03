const MENU_HEADERS = [
  "slug",
  "name",
  "description",
  "price",
  "active",
  "featured",
  "category",
  "sort_order",
  "image_slug",
  "image_url",
  "allergens",
  "notes",
] as const

export interface MenuSheetRow {
  slug: string
  name: string
  description: string
  /** Price in cents. */
  priceCents: number
  active: boolean
  featured: boolean
  category: string
  sortOrder: number
  imageSlug: string
  imageUrl: string
  allergens: string[]
  notes: string
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_")
}

function parseBoolean(value: string): boolean {
  const v = value.trim().toLowerCase()
  return v === "true" || v === "yes" || v === "1" || v === "y"
}

/** Parse sheet price as dollars (e.g. 21 or 21.5) → cents. */
export function parseMenuPrice(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, "").trim()
  if (!cleaned) return 0
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 0) return 0
  if (cleaned.includes(".") || n < 500) {
    return Math.round(n * 100)
  }
  return Math.round(n)
}

function parseAllergens(value: string): string[] {
  if (!value.trim()) return []
  return value
    .split(/[,;]+/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

function parseSortOrder(value: string): number {
  const n = Number(value.trim())
  return Number.isFinite(n) ? n : 9999
}

function rowToRecord(
  headers: string[],
  row: string[]
): Record<string, string> {
  const record: Record<string, string> = {}
  for (let i = 0; i < headers.length; i++) {
    record[headers[i]!] = (row[i] ?? "").trim()
  }
  return record
}

export function parseMenuSheetRows(values: string[][]): MenuSheetRow[] {
  if (values.length === 0) return []

  const headerRow = values[0] ?? []
  const headers = headerRow.map(normalizeHeader)
  const slugIdx = headers.indexOf("slug")
  if (slugIdx === -1) {
    throw new Error(
      `Menu tab must include a slug column. Expected: ${MENU_HEADERS.join(", ")}`
    )
  }

  const rows: MenuSheetRow[] = []

  for (let r = 1; r < values.length; r++) {
    const row = values[r]
    if (!row?.length) continue

    const record = rowToRecord(headers, row)
    const slug = record.slug?.trim()
    if (!slug) continue

    rows.push({
      slug,
      name: record.name?.trim() ?? "",
      description: record.description?.trim() ?? "",
      priceCents: parseMenuPrice(record.price ?? ""),
      active: parseBoolean(record.active ?? ""),
      featured: parseBoolean(record.featured ?? ""),
      category: record.category?.trim() ?? "",
      sortOrder: parseSortOrder(record.sort_order ?? ""),
      imageSlug: record.image_slug?.trim() ?? "",
      imageUrl: record.image_url?.trim() ?? "",
      allergens: parseAllergens(record.allergens ?? ""),
      notes: record.notes?.trim() ?? "",
    })
  }

  return rows
}

export function activeMenuRows(rows: MenuSheetRow[]): MenuSheetRow[] {
  return rows
    .filter((row) => row.active && row.slug && row.name)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/** Format cents for the sheet price column (dollars). */
export function formatMenuPriceForSheet(priceCents: number): string {
  return (priceCents / 100).toFixed(priceCents % 100 === 0 ? 0 : 2)
}

export function formatAllergensForSheet(allergens: string[]): string {
  return allergens.join(", ")
}

export function formatBooleanForSheet(value: boolean): string {
  return value ? "TRUE" : "FALSE"
}

export function menuRowToSheetValues(row: MenuSheetRow): string[] {
  return [
    row.slug,
    row.name,
    row.description,
    formatMenuPriceForSheet(row.priceCents),
    formatBooleanForSheet(row.active),
    formatBooleanForSheet(row.featured),
    row.category,
    String(row.sortOrder),
    row.imageSlug,
    row.imageUrl,
    formatAllergensForSheet(row.allergens),
    row.notes,
  ]
}
