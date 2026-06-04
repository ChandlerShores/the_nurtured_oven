"use client"

import { useCallback } from "react"
import { adminBtnPrimary } from "@/components/admin/ui/admin-button"
import { packSizeForItem } from "@/lib/admin/production-pack-size"
import type { ItemQuantity } from "@/lib/admin/production-aggregate"
import "./production-bake-list-print.css"

interface ProductionBakeListPrintProps {
  batchLabel: string
  prepDayLabel: string
  itemsToBake: number
  productionList: ItemQuantity[]
}

function printedOnLabel(): string {
  return new Date().toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function ProductionBakeListPrint({
  batchLabel,
  prepDayLabel,
  itemsToBake,
  productionList,
}: ProductionBakeListPrintProps) {
  const canPrint = productionList.length > 0

  const handlePrint = useCallback(() => {
    if (!canPrint) return
    document.body.classList.add("bake-list-print-active")
    const cleanup = () => {
      document.body.classList.remove("bake-list-print-active")
    }
    window.addEventListener("afterprint", cleanup, { once: true })
    window.print()
  }, [canPrint])

  return (
    <>
      <button
        type="button"
        className={adminBtnPrimary}
        disabled={!canPrint}
        onClick={handlePrint}
        title={
          canPrint
            ? "Print a formatted bake list"
            : "Add orders before printing"
        }
      >
        Print bake list
      </button>

      <div
        className="bake-list-print-sheet"
        aria-hidden="true"
      >
        <p className="bake-list-print-brand">The Nurtured Oven</p>
        <h1 className="bake-list-print-title">Bake list</h1>

        <dl className="bake-list-print-meta">
          <div>
            <dt>Fulfillment</dt>
            <dd>{batchLabel || "—"}</dd>
          </div>
          <div>
            <dt>Prep timing</dt>
            <dd>{prepDayLabel || "—"}</dd>
          </div>
          <div>
            <dt>Total units</dt>
            <dd>
              {itemsToBake} item{itemsToBake === 1 ? "" : "s"}
            </dd>
          </div>
          <div>
            <dt>Printed</dt>
            <dd>{printedOnLabel()}</dd>
          </div>
        </dl>

        {productionList.length === 0 ? (
          <p className="bake-list-print-empty">No items to bake this week.</p>
        ) : (
          <table className="bake-list-print-table">
            <thead>
              <tr>
                <th className="check-col" scope="col">
                  Done
                </th>
                <th scope="col">Item</th>
                <th className="qty-col" scope="col">
                  Qty
                </th>
                <th scope="col">Pack size</th>
              </tr>
            </thead>
            <tbody>
              {productionList.map((item) => (
                <tr key={item.name}>
                  <td>
                    <span className="bake-list-print-check" aria-hidden="true" />
                  </td>
                  <td className="item-name">{item.name}</td>
                  <td className="item-qty">{item.qty}</td>
                  <td className="item-pack">{packSizeForItem(item.name)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="bake-list-print-footer">
          Check labels, allergy notes, and pickup vs delivery before packing.
          Quantities from paid order lines.
        </p>
      </div>
    </>
  )
}
