/**
 * Seed Product Costs and Weekly Expenses tabs (headers + starter rows).
 * Run: pnpm sheets:seed-financials
 *
 * Idempotent: skips slugs / SEED expenses already present.
 */
import { buildCurrentMenuFromSheetRows } from "../lib/content/menu-from-sheet"
import { loadEnvLocal } from "./lib/load-env-local"
import { fallbackCurrentMenu } from "../lib/content/currentMenu"
import {
  DEFAULT_PRODUCT_COSTS_RANGE,
  DEFAULT_WEEKLY_EXPENSES_RANGE,
  getSheetsClient,
  sheetTabFromRange,
} from "../lib/google-sheets/client"
import { activeMenuRows, parseMenuSheetRows } from "../lib/google-sheets/menu-parse"
import { buildWeeklyCatalog } from "../lib/order/catalog-build"
import {
  addCalendarDays,
  formatBatchLabel,
  getFulfillmentFridayYmd,
} from "../lib/order/weekly-fulfillment"

const PRODUCT_COSTS_TAB = sheetTabFromRange(DEFAULT_PRODUCT_COSTS_RANGE)
const WEEKLY_EXPENSES_TAB = sheetTabFromRange(DEFAULT_WEEKLY_EXPENSES_RANGE)

const PRODUCT_COSTS_HEADERS = [
  "Item slug",
  "Item name",
  "Ingredient cost per unit",
  "Packaging cost per unit",
  "Labor minutes per unit",
  "Active",
  "Notes",
]

const WEEKLY_EXPENSES_HEADERS = [
  "Expense timestamp",
  "Expense date",
  "Fulfillment date",
  "Category",
  "Vendor",
  "Description",
  "Amount",
  "Payment method",
  "Notes",
]

const SEED_NOTE = "SEED — sample row; edit or delete"

const WEEKS_OF_EXPENSES = 5

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/\s+/g, " ")
}

function hasExpectedHeader(row: string[] | undefined, expected: string[]): boolean {
  if (!row?.length) return false
  const got = row.map(normalizeHeader)
  const want = expected.map(normalizeHeader)
  return want.every((h, i) => got[i] === h)
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

function formatMoney(cents: number): string {
  return (cents / 100).toFixed(2)
}

function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    return state / 0x1_0000_0000
  }
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!
}

function fridaysGoingBack(weeks: number): { ymd: string; label: string }[] {
  let { year, month, day } = getFulfillmentFridayYmd(new Date())
  const fridays: { ymd: string; label: string }[] = []

  for (let i = 0; i < weeks; i++) {
    fridays.push({
      ymd: formatYmd(year, month, day),
      label: formatBatchLabel(year, month, day),
    })
    const prev = addCalendarDays(year, month, day, -7)
    year = prev.year
    month = prev.month
    day = prev.day
  }

  return fridays.reverse()
}

function estimateProductCostRow(item: {
  slug: string
  name: string
  priceCents: number
}): string[] {
  const ingredientCents = Math.round(item.priceCents * 0.32)
  const packagingCents = Math.max(50, Math.round(item.priceCents * 0.06))
  const laborMinutes = item.priceCents >= 2000 ? 18 : 12

  return [
    item.slug,
    item.name,
    formatMoney(ingredientCents),
    formatMoney(packagingCents),
    String(laborMinutes),
    "TRUE",
    SEED_NOTE,
  ]
}

type CatalogSeedItem = { slug: string; name: string; priceCents: number }

async function loadCatalogForSeed(
  client: NonNullable<ReturnType<typeof getSheetsClient>>
): Promise<CatalogSeedItem[]> {
  const menuRange = process.env.GOOGLE_SHEETS_MENU_RANGE?.trim() || "Menu!A:L"
  const menuTab = sheetTabFromRange(menuRange)

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range: menuRange.includes("!") ? menuRange : `${menuTab}!A:L`,
    })
    const values = (res.data.values as string[][]) ?? []
    const menu = buildCurrentMenuFromSheetRows(
      activeMenuRows(parseMenuSheetRows(values))
    )
    if (menu) {
      return buildWeeklyCatalog(menu).map((i) => ({
        slug: i.slug,
        name: i.name,
        priceCents: i.priceCents,
      }))
    }
  } catch {
    // fall through to hardcoded menu
  }

  return buildWeeklyCatalog(fallbackCurrentMenu).map((i) => ({
    slug: i.slug,
    name: i.name,
    priceCents: i.priceCents,
  }))
}

async function ensureSheetTab(
  client: NonNullable<ReturnType<typeof getSheetsClient>>,
  title: string
): Promise<void> {
  const meta = await client.sheets.spreadsheets.get({
    spreadsheetId: client.spreadsheetId,
    fields: "sheets.properties.title",
  })
  const titles =
    meta.data.sheets?.map((s) => s.properties?.title).filter(Boolean) ?? []
  if (titles.includes(title)) return

  await client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: client.spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title } } }],
    },
  })
  console.log(`Created tab: ${title}`)
}

async function readTabValues(
  client: NonNullable<ReturnType<typeof getSheetsClient>>,
  tab: string,
  cols: string
): Promise<string[][]> {
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!A:${cols}`,
  })
  return (res.data.values as string[][]) ?? []
}

async function seedProductCosts(
  client: NonNullable<ReturnType<typeof getSheetsClient>>
): Promise<void> {
  await ensureSheetTab(client, PRODUCT_COSTS_TAB)

  const values = await readTabValues(client, PRODUCT_COSTS_TAB, "G")
  const hasHeader = hasExpectedHeader(values[0], PRODUCT_COSTS_HEADERS)

  if (!hasHeader) {
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${PRODUCT_COSTS_TAB}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [PRODUCT_COSTS_HEADERS] },
    })
    console.log("Wrote Product Costs header row.")
  }

  const refreshed = await readTabValues(client, PRODUCT_COSTS_TAB, "G")
  const existingSlugs = new Set(
    refreshed
      .slice(1)
      .map((r) => (r[0] ?? "").trim().toLowerCase())
      .filter(Boolean)
  )

  const catalog = await loadCatalogForSeed(client)
  const toAppend = catalog
    .filter((item) => !existingSlugs.has(item.slug.toLowerCase()))
    .map(estimateProductCostRow)

  if (toAppend.length === 0) {
    console.log("Product Costs: all menu items already have rows — nothing to append.")
    return
  }

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: DEFAULT_PRODUCT_COSTS_RANGE,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: toAppend },
  })

  console.log(
    `Product Costs: appended ${toAppend.length} row(s): ${catalog
      .filter((i) => !existingSlugs.has(i.slug.toLowerCase()))
      .map((i) => i.slug)
      .join(", ")}`
  )
}

const EXPENSE_BLUEPRINTS: {
  category: string
  vendor: string
  description: string
  amountMin: number
  amountMax: number
  paymentMethod: string
}[] = [
  {
    category: "Ingredients",
    vendor: "Grocery / bulk",
    description: "Flour, butter, and mix-ins",
    amountMin: 72,
    amountMax: 118,
    paymentMethod: "Debit card",
  },
  {
    category: "Packaging",
    vendor: "Packaging supply",
    description: "Boxes, liners, and labels",
    amountMin: 28,
    amountMax: 52,
    paymentMethod: "Business card",
  },
  {
    category: "Supplies",
    vendor: "Restaurant supply",
    description: "Parchment, gloves, cleaning",
    amountMin: 18,
    amountMax: 38,
    paymentMethod: "Debit card",
  },
  {
    category: "Delivery",
    vendor: "Fuel",
    description: "Friday delivery routes",
    amountMin: 22,
    amountMax: 45,
    paymentMethod: "Debit card",
  },
  {
    category: "Overhead",
    vendor: "Misc",
    description: "Printer ink & small tools",
    amountMin: 12,
    amountMax: 35,
    paymentMethod: "Cash",
  },
]

function buildExpenseRows(
  fridays: { ymd: string; label: string }[],
  rng: () => number
): string[][] {
  const rows: string[][] = []
  const ts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  for (const batch of fridays) {
    const [y, m, d] = batch.ymd.split("-").map(Number)
    const expenseDay = addCalendarDays(y, m, d, -2)
    const expenseDate = formatYmd(
      expenseDay.year,
      expenseDay.month,
      expenseDay.day
    )
    const picked = EXPENSE_BLUEPRINTS.slice(0, 3 + Math.floor(rng() * 2))

    for (const bp of picked) {
      const amount =
        bp.amountMin + Math.floor(rng() * (bp.amountMax - bp.amountMin + 1))
      rows.push([
        ts.format(new Date(expenseDay.year, expenseDay.month - 1, expenseDay.day, 10, 0)),
        expenseDate,
        batch.ymd,
        bp.category,
        bp.vendor,
        bp.description,
        formatMoney(amount * 100),
        bp.paymentMethod,
        SEED_NOTE,
      ])
    }
  }

  return rows
}

async function seedWeeklyExpenses(
  client: NonNullable<ReturnType<typeof getSheetsClient>>
): Promise<void> {
  await ensureSheetTab(client, WEEKLY_EXPENSES_TAB)

  const values = await readTabValues(client, WEEKLY_EXPENSES_TAB, "J")
  const hasHeader = hasExpectedHeader(values[0], WEEKLY_EXPENSES_HEADERS)

  if (!hasHeader) {
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${WEEKLY_EXPENSES_TAB}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [WEEKLY_EXPENSES_HEADERS] },
    })
    console.log("Wrote Weekly Expenses header row.")
  }

  const refreshed = await readTabValues(client, WEEKLY_EXPENSES_TAB, "J")
  const hasSeedRows = refreshed
    .slice(1)
    .some((r) => (r[8] ?? "").includes("SEED"))

  if (hasSeedRows) {
    console.log("Weekly Expenses: SEED rows already present — skipping append.")
    return
  }

  const fridays = fridaysGoingBack(WEEKS_OF_EXPENSES)
  const rng = createRng(42_026_0602)
  const rows = buildExpenseRows(fridays, rng)

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: DEFAULT_WEEKLY_EXPENSES_RANGE,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows },
  })

  console.log(
    `Weekly Expenses: appended ${rows.length} sample row(s) across ${fridays.length} bake weeks (${fridays.map((f) => f.ymd).join(", ")}).`
  )
}

async function main() {
  loadEnvLocal()

  const client = getSheetsClient()
  if (!client) {
    throw new Error(
      "Google Sheets not configured. Set GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY in .env.local"
    )
  }

  console.log("Seeding financial tabs…\n")
  await seedProductCosts(client)
  console.log("")
  await seedWeeklyExpenses(client)
  console.log("\nDone. Filter Notes containing SEED to find sample expense rows.")
  console.log("Adjust product costs in /admin/financials or the Product Costs tab.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
