import { redirect } from "next/navigation"
import AdminFinancialsView from "@/components/admin/AdminFinancialsView"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { buildFinancialDashboardPayload } from "@/lib/admin/financial-stats"
import { fetchAllOrdersFromSheet, fetchAllOrderLineItemsFromSheet } from "@/lib/google-sheets/orders"
import { fetchAllMenuRowsFromSheet } from "@/lib/google-sheets/menu-admin"
import {
  fetchProductCostsFromSheet,
  type ProductCostRow,
} from "@/lib/google-sheets/product-costs"
import { fetchAllWeeklyExpensesFromSheet } from "@/lib/google-sheets/weekly-expenses"

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
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login?next=/admin/financials")
  }

  let loadError: string | null = null
  let data: ReturnType<typeof buildFinancialDashboardPayload> | null = null

  try {
    const [orders, lineItems, productCosts, expenses, menu] = await Promise.all([
      fetchAllOrdersFromSheet(),
      fetchAllOrderLineItemsFromSheet(),
      fetchProductCostsFromSheet().catch(() => []),
      fetchAllWeeklyExpensesFromSheet().catch(() => []),
      fetchAllMenuRowsFromSheet().catch(() => ({
        rows: [],
        tabName: "Menu",
        loadedAt: "",
      })),
    ])

    const mergedCosts = mergeMenuWithProductCosts(productCosts, menu.rows)

    const weekKey = searchParams.week?.trim()
    data = buildFinancialDashboardPayload(
      orders,
      lineItems,
      mergedCosts,
      expenses,
      weekKey || undefined
    )
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "Could not load financial data from Google Sheets."
  }

  return (
    <>
      <SectionHeader
        title="Financials"
        subtitle="How did this bake week perform? Estimates from paid orders, product costs, and weekly expenses."
      />

      {loadError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-6">
          {loadError}
        </p>
      ) : data ? (
        <AdminFinancialsView initialData={data} />
      ) : null}
    </>
  )
}
