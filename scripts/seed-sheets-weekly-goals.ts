/**
 * Seed Weekly Goals tab (header row + optional default target row).
 * Run: pnpm sheets:seed-weekly-goals
 *
 * Idempotent: skips header if already correct; skips default row if present.
 */
import { loadEnvLocal } from "./lib/load-env-local"
import {
  DEFAULT_WEEKLY_GOALS_RANGE,
  getSheetsClient,
  sheetTabFromRange,
} from "../lib/google-sheets/client"
import { parseWeeklyGoalDataRows } from "../lib/google-sheets/weekly-goals-data"

const WEEKLY_GOALS_TAB = sheetTabFromRange(DEFAULT_WEEKLY_GOALS_RANGE)

const WEEKLY_GOALS_HEADERS = [
  "fulfillment_date",
  "revenue_goal",
  "order_goal",
  "notes",
  "updated_at",
]

const DEFAULT_ROW_NOTE =
  "Default targets when no bake-week row exists — edit in /admin/settings"

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/\s+/g, "_")
}

function hasExpectedHeader(row: string[] | undefined, expected: string[]): boolean {
  if (!row?.length) return false
  const got = row.map(normalizeHeader)
  const want = expected.map(normalizeHeader)
  return want.every((h, i) => got[i] === h)
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
  client: NonNullable<ReturnType<typeof getSheetsClient>>
): Promise<string[][]> {
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: `${WEEKLY_GOALS_TAB}!A1:E`,
  })
  return (res.data.values as string[][]) ?? []
}

async function seedWeeklyGoals(
  client: NonNullable<ReturnType<typeof getSheetsClient>>
): Promise<void> {
  await ensureSheetTab(client, WEEKLY_GOALS_TAB)

  const values = await readTabValues(client)
  const hasHeader = hasExpectedHeader(values[0], WEEKLY_GOALS_HEADERS)

  if (!hasHeader) {
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${WEEKLY_GOALS_TAB}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [WEEKLY_GOALS_HEADERS] },
    })
    console.log("Wrote Weekly Goals header row.")
  } else {
    console.log("Weekly Goals header row already present.")
  }

  const refreshed = await readTabValues(client)
  const parsed = parseWeeklyGoalDataRows(refreshed)
  const hasDefault = parsed.some(
    (r) => r.fulfillmentDate.trim().toLowerCase() === "default"
  )

  if (hasDefault) {
    console.log("Weekly Goals: default row already present — skipping append.")
    return
  }

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: DEFAULT_WEEKLY_GOALS_RANGE,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          "default",
          "400",
          "15",
          DEFAULT_ROW_NOTE,
          "",
        ],
      ],
    },
  })

  console.log(
    "Weekly Goals: appended optional default row (revenue $400, 15 orders). Edit or delete in Sheets or /admin/settings."
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

  console.log("Seeding Weekly Goals tab…\n")
  await seedWeeklyGoals(client)
  console.log("\nDone.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
