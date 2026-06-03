/**
 * Append rows to the Google Sheets Menu tab (or seed headers + fallback items).
 * Run: pnpm sheets:append-menu
 */
import { readFileSync } from "fs"
import { getSheetsClient, sheetTabFromRange } from "../lib/google-sheets/client"
import {
  activeMenuRows,
  parseMenuSheetRows,
} from "../lib/google-sheets/menu-parse"
import { buildCurrentMenuFromSheetRows } from "../lib/content/menu-from-sheet"

const DEFAULT_MENU_RANGE = "Menu!A:L"

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
]

function loadEnvLocal(): void {
  try {
    const raw = readFileSync(".env.local", "utf8")
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const i = trimmed.indexOf("=")
      if (i < 0) continue
      const key = trimmed.slice(0, i).trim()
      let value = trimmed.slice(i + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    console.warn("No .env.local found; using existing process.env")
  }
}

type MenuAppendRow = {
  slug: string
  name: string
  description: string
  price: number
  active: boolean
  featured: boolean
  category: string
  sortOrder: number
  imageSlug: string
  imageUrl: string
  allergens: string
  notes: string
}

function toSheetRow(row: MenuAppendRow): string[] {
  return [
    row.slug,
    row.name,
    row.description,
    String(row.price),
    row.active ? "TRUE" : "FALSE",
    row.featured ? "TRUE" : "FALSE",
    row.category,
    String(row.sortOrder),
    row.imageSlug,
    row.imageUrl,
    row.allergens,
    row.notes,
  ]
}

const FALLBACK_ROWS: MenuAppendRow[] = [
  {
    slug: "cinnamon-rolls",
    name: "Cinnamon Rolls",
    description:
      "Soft, cozy cinnamon rolls finished with homemade frosting.",
    price: 21,
    active: true,
    featured: true,
    category: "This Week's Feature",
    sortOrder: 1,
    imageSlug: "cinnamon-rolls",
    imageUrl: "/images/cinnamon_roll_hero.png",
    allergens: "wheat, eggs, dairy",
    notes: "4-pack",
  },
  {
    slug: "oatmeal-cookie",
    name: "Oatmeal Cookie",
    description:
      "A cozy small-batch favorite with familiar, homemade comfort in every bite.",
    price: 18,
    active: true,
    featured: false,
    category: "Signature Staple",
    sortOrder: 2,
    imageSlug: "oatmeal-cookie",
    imageUrl: "/images/oatmeal_cookie_spring.png",
    allergens: "wheat, eggs, dairy",
    notes: "6-pack",
  },
  {
    slug: "marshmallow-cloud-bar",
    name: "Marshmallow Cloud Bar",
    description:
      "A soft, dreamy treat with a nostalgic, cloud-like sweetness.",
    price: 16,
    active: true,
    featured: false,
    category: "Special Treat",
    sortOrder: 3,
    imageSlug: "marshmallow-cloud-bar",
    imageUrl: "/images/marshmallow-cloud-bar.png",
    allergens: "wheat, dairy, soy",
    notes: "4-pack",
  },
]

/** New item to append for this test run. */
const NEW_ITEM: MenuAppendRow = {
  slug: "brown-butter-blondie",
  name: "Brown Butter Blondie",
  description:
    "Rich blondie bars with brown butter and a hint of vanilla — cut small and shareable.",
  price: 14,
  active: true,
  featured: false,
  category: "Special Treat",
  sortOrder: 4,
  imageSlug: "brown-butter-blondie",
  imageUrl: "",
  allergens: "wheat, eggs, dairy",
  notes: "4-pack",
}

async function main() {
  loadEnvLocal()

  const client = getSheetsClient()
  if (!client) {
    throw new Error(
      "Google Sheets not configured. Set GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY in .env.local"
    )
  }

  const menuRange =
    process.env.GOOGLE_SHEETS_MENU_RANGE?.trim() || DEFAULT_MENU_RANGE
  const tab = sheetTabFromRange(menuRange)

  const existing = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: menuRange.includes("!") ? menuRange : `${tab}!A:L`,
  })

  const values = (existing.data.values as string[][]) ?? []
  const hasHeader =
    values.length > 0 &&
    values[0]?.[0]?.trim().toLowerCase().replace(/\s+/g, "_") === "slug"

  if (!hasHeader) {
    console.log("Menu tab empty or missing headers — writing header row + fallback items…")
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [MENU_HEADERS, ...FALLBACK_ROWS.map(toSheetRow)],
      },
    })
  }

  const refreshed = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: menuRange.includes("!") ? menuRange : `${tab}!A:L`,
  })
  const rows = parseMenuSheetRows((refreshed.data.values as string[][]) ?? [])
  const slugs = new Set(rows.map((r) => r.slug))

  if (slugs.has(NEW_ITEM.slug)) {
    console.log(`"${NEW_ITEM.slug}" already on Menu tab — skipping append.`)
  } else {
    await client.sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: `${tab}!A:L`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [toSheetRow(NEW_ITEM)] },
    })
    console.log(`Appended new menu item: ${NEW_ITEM.name} (${NEW_ITEM.slug})`)
  }

  const missingFallback = FALLBACK_ROWS.filter((row) => !slugs.has(row.slug))
  if (missingFallback.length > 0) {
    await client.sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: `${tab}!A:L`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: missingFallback.map(toSheetRow) },
    })
    console.log(
      `Added ${missingFallback.length} standard menu row(s): ${missingFallback.map((r) => r.slug).join(", ")}`
    )
  }

  const finalRes = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: menuRange.includes("!") ? menuRange : `${tab}!A:L`,
  })
  const menu = buildCurrentMenuFromSheetRows(
    activeMenuRows(
      parseMenuSheetRows((finalRes.data.values as string[][]) ?? [])
    )
  )
  if (!menu) {
    throw new Error("Menu tab has no active rows after append.")
  }
  const slugsOnSite = [menu.featured.slug, ...menu.items.map((i) => i.slug)]
  console.log("\nMenu loaded from sheet:")
  console.log("  Featured:", menu.featured.name)
  console.log("  Items:", menu.items.map((i) => i.name).join(", ") || "(none)")
  console.log("  Slugs:", slugsOnSite.join(", "))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
