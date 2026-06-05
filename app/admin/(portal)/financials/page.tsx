import { Suspense } from "react"
import AdminFinancialsView from "@/components/admin/AdminFinancialsView"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { buildFinancialDashboardPayload } from "@/lib/admin/financial-stats"
import { fetchAllOrdersFromSheet, fetchAllOrderLineItemsFromSheet } from "@/lib/google-sheets/orders"
import { fetchAllMenuRowsFromSheet } from "@/lib/google-sheets/menu-admin"
import {
  fetchProductCostsFromSheet,
  type ProductCostRow,
} from "@/lib/google-sheets/product-costs"
import { fetchAllWeeklyExpensesFromSheet } from "@/lib/google-sheets/weekly-expenses"
import { fetchAllWeeklyGoalsFromSheet } from "@/lib/google-sheets/weekly-goals"

function mergeMenuWithProductCosts(
  costs: ProductCostRow[],
  menuRows: Awaited<ReturnType<typeof fetchAllMenuRowsFromSheet>>["rows"]
): ProductCostRow[] {
  const bySlug = new Map(costs.map((c) => [c.slug.toLowerCase(), c]))
  const merged = [...costs]
  for (const item of menuRows) {
    const key = item.slug.toLowerCase()
    if (bySlug.has(key)) continue
    merged.push({
      sheetRow: 0,
      slug: item.slug,
      name: item.name,
      ingredientCostPerUnitCents: 0,
      packagingCostPerUnitCents: 0,
      laborMinutesPerUnit: 0,
      active: true,
      notes: "",
    })
  }
  return merged.sort((a, b) => a.name.localeCompare(b.name))
}

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: { week?: string }
}

export default async function AdminFinancialsPage({ searchParams }: PageProps) {
  let loadError: string | null = null
  const loadWarnings: string[] = []
  let data: ReturnType<typeof buildFinancialDashboardPayload> | null = null

  try {
    const [orders, lineItems, weeklyGoalRows] = await Promise.all([
      fetchAllOrdersFromSheet(),
      fetchAllOrderLineItemsFromSheet(),
      fetchAllWeeklyGoalsFromSheet(),
    ])

    let productCosts: ProductCostRow[] = []
    try {
      productCosts = await fetchProductCostsFromSheet()
    } catch {
      loadWarnings.push("Product costs tab could not be loaded.")
    }

    let expenses: Awaited<ReturnType<typeof fetchAllWeeklyExpensesFromSheet>> = []
    try {
      expenses = await fetchAllWeeklyExpensesFromSheet()
    } catch {
      loadWarnings.push("Weekly expenses tab could not be loaded.")
    }

    let menuRows: Awaited<ReturnType<typeof fetchAllMenuRowsFromSheet>>["rows"] = []
    try {
      const menu = await fetchAllMenuRowsFromSheet()
      menuRows = menu.rows
    } catch {
      loadWarnings.push("Menu could not be loaded for cost editor defaults.")
    }

    const mergedCosts = mergeMenuWithProductCosts(productCosts, menuRows)
    const weekKey = searchParams.week?.trim()

    data = buildFinancialDashboardPayload(
      orders,
      lineItems,
      mergedCosts,
      expenses,
      weekKey || undefined,
      weeklyGoalRows
    )
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "Could not load financial data from Google Sheets."
  }

  return (
    <>
      <SectionHeader title="Financials" />

      {loadWarnings.length > 0 ? (
        <ul className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-soft px-4 py-3 mb-4 list-disc list-inside space-y-1">
          {loadWarnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      {loadError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-6">
          {loadError}
        </p>
      ) : data ? (
        <Suspense fallback={null}>
          <AdminFinancialsView initialData={data} />
        </Suspense>
      ) : null}
    </>
  )
}
