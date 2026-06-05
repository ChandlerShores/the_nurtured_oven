"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ExpenseCategoryChart,
  FinancialDetailsStrip,
  FinancialHero,
  MoneyFlowChart,
  ProductMixChart,
  WeekRevenueTrendChart,
} from "@/components/admin/financials/FinancialsVisuals"
import FinancialsReviewAlert from "@/components/admin/financials/FinancialsReviewAlert"
import FinancialsSection, {
  FINANCIALS_WEEKLY_GOALS_SECTION_ID,
} from "@/components/admin/financials/FinancialsSection"
import ThisWeekGoalsEditor from "@/components/admin/ThisWeekGoalsEditor"
import WeekGoalProgressCard from "@/components/admin/WeekGoalProgress"
import { buildWeekGoalProgress } from "@/lib/admin/bakery-goals"
import type { BakeryWeekGoals } from "@/lib/admin/bakery-goals"
import type { FinancialWeekGoalsSnapshot } from "@/lib/admin/financial-stats-types"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import { adminBtnPrimary } from "@/components/admin/ui/admin-button"
import { formatCentsDisplay, formatPercent } from "@/lib/admin/money"
import type {
  FinancialDashboardData,
  FinancialProductCostRow,
} from "@/lib/admin/financial-stats-types"

interface AdminFinancialsViewProps {
  initialData: FinancialDashboardData
}

interface CostDraft {
  sheetRow?: number
  slug: string
  name: string
  ingredient: string
  packaging: string
  laborMinutes: string
  active: boolean
  notes: string
}

function snapshotGoalsToBakery(
  g: FinancialWeekGoalsSnapshot
): BakeryWeekGoals {
  return {
    revenueGoalCents: g.revenueGoalCents,
    orderGoalCount: g.orderGoalCount,
    source: g.source,
    notes: g.notes,
  }
}

function costsToDrafts(costs: FinancialProductCostRow[]): CostDraft[] {
  return costs.map((c) => ({
    sheetRow: c.sheetRow,
    slug: c.slug,
    name: c.name,
    ingredient: c.ingredientCostPerUnitCents
      ? (c.ingredientCostPerUnitCents / 100).toFixed(2)
      : "",
    packaging: c.packagingCostPerUnitCents
      ? (c.packagingCostPerUnitCents / 100).toFixed(2)
      : "",
    laborMinutes: String(c.laborMinutesPerUnit || ""),
    active: c.active,
    notes: c.notes,
  }))
}

export default function AdminFinancialsView({
  initialData,
}: AdminFinancialsViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { weekOptions, weekSnapshots, weekTrend, productCosts, estimateNotes } =
    initialData

  const [activeWeekKey, setActiveWeekKey] = useState(initialData.initialWeekKey)

  const weekFromUrl = searchParams.get("week")?.trim() ?? ""

  useEffect(() => {
    if (weekFromUrl && weekSnapshots[weekFromUrl]) {
      setActiveWeekKey(weekFromUrl)
    }
  }, [weekFromUrl, weekSnapshots])

  const selectWeek = useCallback(
    (weekKey: string) => {
      setActiveWeekKey(weekKey)
      const params = new URLSearchParams(searchParams.toString())
      params.set("week", weekKey)
      router.replace(`/admin/financials?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const snapshot = useMemo(() => {
    return (
      weekSnapshots[activeWeekKey] ??
      weekSnapshots[initialData.initialWeekKey] ??
      Object.values(weekSnapshots)[0]
    )
  }, [activeWeekKey, weekSnapshots, initialData.initialWeekKey])

  const summary = snapshot?.summary
  const weekGoalProgress = useMemo(() => {
    if (!summary || !snapshot?.weekGoals) return null
    return buildWeekGoalProgress(
      summary.grossRevenueCents,
      summary.paidOrderCount,
      snapshot.weekGoals
    )
  }, [summary, snapshot?.weekGoals])
  const productProfit = snapshot?.productProfit ?? []
  const expenses = snapshot?.expenses ?? []
  const selectedWeek = snapshot?.selectedWeek

  const costsSyncKey = useMemo(
    () =>
      productCosts
        .map(
          (c) =>
            `${c.sheetRow}:${c.slug}:${c.ingredientCostPerUnitCents}:${c.packagingCostPerUnitCents}:${c.laborMinutesPerUnit}:${c.active}`
        )
        .join("|"),
    [productCosts]
  )

  const [costDrafts, setCostDrafts] = useState<CostDraft[]>(() =>
    costsToDrafts(productCosts)
  )
  const [syncedCostsKey, setSyncedCostsKey] = useState(costsSyncKey)

  useEffect(() => {
    if (costsSyncKey !== syncedCostsKey) {
      setCostDrafts(costsToDrafts(productCosts))
      setSyncedCostsKey(costsSyncKey)
    }
  }, [costsSyncKey, syncedCostsKey, productCosts])
  const [costSaving, setCostSaving] = useState(false)
  const [costMessage, setCostMessage] = useState<string | null>(null)

  const [expenseDate, setExpenseDate] = useState("")
  const [expenseCategory, setExpenseCategory] = useState("")
  const [expenseVendor, setExpenseVendor] = useState("")
  const [expenseDescription, setExpenseDescription] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expensePayment, setExpensePayment] = useState("")
  const [expenseNotes, setExpenseNotes] = useState("")
  const [expenseSaving, setExpenseSaving] = useState(false)
  const [expenseError, setExpenseError] = useState<string | null>(null)

  const fulfillmentForExpense = selectedWeek?.fulfillmentDate ?? ""
  const goalsSectionReady = Boolean(
    snapshot?.weekGoalsEditor && selectedWeek
  )

  useEffect(() => {
    if (!goalsSectionReady) return
    const hash = window.location.hash.replace(/^#/, "")
    if (hash !== FINANCIALS_WEEKLY_GOALS_SECTION_ID) return

    const scrollToGoals = () => {
      document
        .getElementById(FINANCIALS_WEEKLY_GOALS_SECTION_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    const timeoutId = window.setTimeout(scrollToGoals, 50)
    window.addEventListener("hashchange", scrollToGoals)
    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener("hashchange", scrollToGoals)
    }
  }, [goalsSectionReady, activeWeekKey])

  const incompleteCosts = costDrafts.filter(
    (c) => c.active && !c.ingredient && !c.packaging && !c.laborMinutes
  )

  async function saveProductCosts() {
    setCostSaving(true)
    setCostMessage(null)
    try {
      const res = await fetch("/api/admin/financials/product-costs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          costs: costDrafts.map((c) => ({
            sheetRow: c.sheetRow,
            slug: c.slug,
            name: c.name,
            ingredientCostPerUnit: c.ingredient,
            packagingCostPerUnit: c.packaging,
            laborMinutesPerUnit: Number(c.laborMinutes) || 0,
            active: c.active,
            notes: c.notes,
          })),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        costs?: FinancialProductCostRow[]
      }
      if (!res.ok) throw new Error(data.error ?? "Could not save.")
      if (data.costs) setCostDrafts(costsToDrafts(data.costs))
      setCostMessage("Product costs saved.")
      router.refresh()
    } catch (err) {
      setCostMessage(
        err instanceof Error ? err.message : "Could not save product costs."
      )
    } finally {
      setCostSaving(false)
    }
  }

  async function submitExpense(e: React.FormEvent) {
    e.preventDefault()
    setExpenseSaving(true)
    setExpenseError(null)
    try {
      const res = await fetch("/api/admin/financials/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseDate,
          fulfillmentDate: fulfillmentForExpense,
          category: expenseCategory,
          vendor: expenseVendor,
          description: expenseDescription,
          amount: expenseAmount,
          paymentMethod: expensePayment,
          notes: expenseNotes,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Could not add expense.")
      setExpenseDate("")
      setExpenseCategory("")
      setExpenseVendor("")
      setExpenseDescription("")
      setExpenseAmount("")
      setExpensePayment("")
      setExpenseNotes("")
      router.refresh()
    } catch (err) {
      setExpenseError(
        err instanceof Error ? err.message : "Could not add expense."
      )
    } finally {
      setExpenseSaving(false)
    }
  }

  if (!summary || !selectedWeek) {
    return (
      <EmptyState
        title="No financial data yet"
        message="Paid orders will populate bake weeks and charts here."
      />
    )
  }

  return (
    <div className="pb-4">
      <FinancialsSection first title="Bake week overview">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="text-sm font-body w-full sm:w-auto sm:min-w-[12rem]">
            <span className="text-caption text-xs uppercase tracking-wide block mb-1">
              Bake week
            </span>
            <select
              value={activeWeekKey}
              onChange={(e) => selectWeek(e.target.value)}
              className="w-full rounded-soft border border-oatmeal/80 bg-warm-white px-3 py-2.5 min-h-[44px] text-base text-charcoal"
            >
              {weekOptions.length === 0 ? (
                <option value="">No paid orders yet</option>
              ) : (
                weekOptions.map((w) => (
                  <option key={w.weekKey} value={w.weekKey}>
                    {w.batchLabel} ({w.paidOrderCount} orders)
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <FinancialHero summary={summary} />

        {weekGoalProgress ? (
          <WeekGoalProgressCard
            progress={weekGoalProgress}
            batchLabel={selectedWeek.batchLabel}
            usingDefaultBackup={
              snapshot.weekGoalsEditor?.usingDefaultBackup ?? false
            }
            showSubtitle={false}
          />
        ) : null}
        <FinancialDetailsStrip summary={summary} estimateNotes={estimateNotes} />
      </FinancialsSection>

      <FinancialsSection title="Charts & trends">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
          <MoneyFlowChart summary={summary} />
          <WeekRevenueTrendChart
            trend={weekTrend}
            activeWeekKey={activeWeekKey}
            onSelectWeek={selectWeek}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
          <ProductMixChart rows={productProfit} />
          <ExpenseCategoryChart expenses={expenses} />
        </div>
      </FinancialsSection>

      <FinancialsSection title="Item breakdown">
        {!summary.hasProductCosts ? (
          <FinancialsReviewAlert title="Profit columns incomplete">
            <p>
              Add product costs in <strong>Costs &amp; expenses</strong> below
              before trusting estimated cost, profit, and margin in this table.
            </p>
          </FinancialsReviewAlert>
        ) : null}
        <DashboardCard>
        {productProfit.length === 0 ? (
          <EmptyState
            title="No item sales"
            message="Paid line items for this week will show here."
          />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-espresso/20 text-caption text-xs uppercase tracking-wide">
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2 text-right">Units</th>
                  <th className="px-3 py-2 text-right">Revenue</th>
                  <th className="px-3 py-2 text-right">Est. cost</th>
                  <th className="px-3 py-2 text-right">Est. profit</th>
                  <th className="px-3 py-2 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {productProfit.map((row, i) => (
                  <tr
                    key={row.slug || row.name}
                    className={`border-b border-espresso/10 ${
                      i % 2 === 0 ? "bg-warm-white" : "bg-linen/35"
                    }`}
                  >
                    <td className="px-3 py-2 font-semibold text-espresso">{row.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.unitsSold}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatCentsDisplay(row.revenueCents)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {summary.hasProductCosts
                        ? formatCentsDisplay(row.estimatedCostCents)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {summary.hasProductCosts
                        ? formatCentsDisplay(row.estimatedProfitCents)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.marginPercent != null
                        ? formatPercent(row.marginPercent)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </DashboardCard>
      </FinancialsSection>

      <FinancialsSection title="Costs & expenses">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
          <DashboardCard title="Weekly expenses">
          {expenses.length === 0 ? (
            <FinancialsReviewAlert title="No expenses logged">
              <p>
                Add ingredients, packaging, delivery supplies, or other costs for
                this bake week using the form below.
              </p>
            </FinancialsReviewAlert>
          ) : (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-espresso/20 text-caption text-xs uppercase tracking-wide">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Vendor</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((row, i) => (
                    <tr
                      key={`${row.sheetRow}-${i}`}
                      className={`border-b border-espresso/10 ${
                        i % 2 === 0 ? "bg-warm-white" : "bg-linen/35"
                      }`}
                    >
                      <td className="px-3 py-2">{row.expenseDate || "—"}</td>
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2">{row.vendor || "—"}</td>
                      <td className="px-3 py-2">{row.description || "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCentsDisplay(row.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form
            onSubmit={submitExpense}
            className="space-y-3 border-t border-espresso/15 pt-4"
          >
            {expenseError ? (
              <p className="text-sm text-red-800">{expenseError}</p>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm block">
                <span className="text-caption text-xs">Date</span>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-espresso/25 px-3 py-2"
                />
              </label>
              <label className="text-sm block">
                <span className="text-caption text-xs">Category</span>
                <input
                  required
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  placeholder="Ingredients, packaging…"
                  className="mt-1 w-full rounded-md border border-espresso/25 px-3 py-2"
                />
              </label>
              <label className="text-sm block">
                <span className="text-caption text-xs">Vendor</span>
                <input
                  value={expenseVendor}
                  onChange={(e) => setExpenseVendor(e.target.value)}
                  className="mt-1 w-full rounded-md border border-espresso/25 px-3 py-2"
                />
              </label>
              <label className="text-sm block">
                <span className="text-caption text-xs">Amount ($)</span>
                <input
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-md border border-espresso/25 px-3 py-2"
                />
              </label>
            </div>
            <label className="text-sm block">
              <span className="text-caption text-xs">Description</span>
              <input
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                className="mt-1 w-full rounded-md border border-espresso/25 px-3 py-2"
              />
            </label>
            <label className="text-sm block">
              <span className="text-caption text-xs">Payment method</span>
              <input
                value={expensePayment}
                onChange={(e) => setExpensePayment(e.target.value)}
                className="mt-1 w-full rounded-md border border-espresso/25 px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={expenseSaving}
              className={adminBtnPrimary}
            >
              {expenseSaving ? "Saving…" : "Add this week's expenses"}
            </button>
          </form>
        </DashboardCard>

        <DashboardCard title="Product costs">
          {!summary.hasProductCosts ? (
            <FinancialsReviewAlert title="Product costs missing">
              <p>
                Enter unit costs here and save — overview profit and item margins
                stay blank until you do.
              </p>
            </FinancialsReviewAlert>
          ) : incompleteCosts.length > 0 ? (
            <FinancialsReviewAlert title="Incomplete cost assumptions">
              <p>
                {incompleteCosts.length} active menu item
                {incompleteCosts.length === 1 ? "" : "s"} still need ingredient,
                packaging, or labor minutes (highlighted below).
              </p>
            </FinancialsReviewAlert>
          ) : null}
          <div className="space-y-3 max-h-[28rem] overflow-y-auto">
            {costDrafts.map((row, index) => (
              <div
                key={row.slug}
                className={`rounded-lg border p-3 text-sm space-y-2 ${
                  row.active && !row.ingredient && !row.packaging && !row.laborMinutes
                    ? "border-terracotta/45 bg-terracotta/10"
                    : "border-espresso/15 bg-linen/25"
                }`}
              >
                <p className="font-semibold text-espresso">
                  {row.name || row.slug}
                  <span className="text-caption text-xs ml-2">{row.slug}</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-xs">
                    Ingredient $
                    <input
                      value={row.ingredient}
                      onChange={(e) => {
                        const next = [...costDrafts]
                        next[index] = { ...row, ingredient: e.target.value }
                        setCostDrafts(next)
                      }}
                      className="mt-0.5 w-full rounded-md border border-espresso/25 px-2 py-1"
                    />
                  </label>
                  <label className="text-xs">
                    Packaging $
                    <input
                      value={row.packaging}
                      onChange={(e) => {
                        const next = [...costDrafts]
                        next[index] = { ...row, packaging: e.target.value }
                        setCostDrafts(next)
                      }}
                      className="mt-0.5 w-full rounded-md border border-espresso/25 px-2 py-1"
                    />
                  </label>
                  <label className="text-xs">
                    Labor min
                    <input
                      value={row.laborMinutes}
                      onChange={(e) => {
                        const next = [...costDrafts]
                        next[index] = { ...row, laborMinutes: e.target.value }
                        setCostDrafts(next)
                      }}
                      className="mt-0.5 w-full rounded-md border border-espresso/25 px-2 py-1"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-espresso/15">
            <button
              type="button"
              disabled={costSaving || costDrafts.length === 0}
              onClick={saveProductCosts}
              className={adminBtnPrimary}
            >
              {costSaving ? "Saving…" : "Save product costs"}
            </button>
            {costMessage ? (
              <p className="text-caption text-sm">{costMessage}</p>
            ) : null}
          </div>
        </DashboardCard>
        </div>
      </FinancialsSection>

      {snapshot.weekGoalsEditor && selectedWeek ? (
        <FinancialsSection
          anchorId={FINANCIALS_WEEKLY_GOALS_SECTION_ID}
          title="Weekly goals"
        >
          <ThisWeekGoalsEditor
            key={activeWeekKey}
            fulfillmentDate={selectedWeek.fulfillmentDate}
            batchLabel={selectedWeek.batchLabel}
            showCardHeader={false}
            weekTargets={snapshotGoalsToBakery(
              snapshot.weekGoalsEditor.weekTargets
            )}
            defaultBackup={{
              revenueGoalCents: null,
              orderGoalCount: null,
              source: "none",
              notes: null,
            }}
            hasWeekSpecificRow={snapshot.weekGoalsEditor.hasWeekSpecificRow}
            usingDefaultBackup={snapshot.weekGoalsEditor.usingDefaultBackup}
            updatedAt={snapshot.weekGoalsEditor.weekRowUpdatedAt}
            showDefaultBackup={false}
          />
        </FinancialsSection>
      ) : null}
    </div>
  )
}
