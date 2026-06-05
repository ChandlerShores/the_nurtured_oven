"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import AdminOrderCustomerEmail from "@/components/admin/AdminOrderCustomerEmail"
import EmptyState from "@/components/admin/ui/EmptyState"
import { orderMatchesSearch } from "@/lib/admin/order-filters"
import { validateOrderForCustomerEmail } from "@/lib/admin/customer-order-email-validation"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

const SUGGESTION_LIMIT = 12

function formatMethod(method: string): string {
  if (method === "delivery") return "Delivery"
  if (method === "pickup") return "Pickup"
  return method || "—"
}

function orderPickerLabel(order: AdminOrderRow): string {
  const name = order.customerName || order.customerEmail || "Customer"
  return `${name} · ${order.internalRef} · ${formatMethod(order.fulfillmentMethod)}`
}

interface AdminMessagesComposerProps {
  orders: AdminOrderRow[]
  batchLabel: string
  initialSelectedRef?: string
}

export default function AdminMessagesComposer({
  orders,
  batchLabel,
  initialSelectedRef,
}: AdminMessagesComposerProps) {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)

  const sendableOrders = useMemo(
    () =>
      [...orders]
        .filter((o) => !validateOrderForCustomerEmail(o))
        .sort((a, b) =>
          (a.customerName || a.customerEmail || a.internalRef).localeCompare(
            b.customerName || b.customerEmail || b.internalRef
          )
        ),
    [orders]
  )

  const orderByRef = useMemo(
    () => new Map(sendableOrders.map((o) => [o.internalRef, o])),
    [sendableOrders]
  )

  const [selectedRef, setSelectedRef] = useState("")
  const [query, setQuery] = useState("")
  const [listOpen, setListOpen] = useState(false)

  const selectedOrder = selectedRef ? orderByRef.get(selectedRef) : undefined

  const suggestions = useMemo(() => {
    const pool = sendableOrders.filter((order) => orderMatchesSearch(order, query))
    return pool.slice(0, SUGGESTION_LIMIT)
  }, [sendableOrders, query])

  const selectOrder = useCallback((order: AdminOrderRow) => {
    setSelectedRef(order.internalRef)
    setQuery(orderPickerLabel(order))
    setListOpen(false)
  }, [])

  useEffect(() => {
    if (!initialSelectedRef || !orderByRef.has(initialSelectedRef)) return
    const order = orderByRef.get(initialSelectedRef)
    if (order) selectOrder(order)
  }, [initialSelectedRef, orderByRef, selectOrder])

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setListOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  function handleEmailSent() {
    router.refresh()
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    setListOpen(true)
    if (selectedRef) {
      const order = orderByRef.get(selectedRef)
      if (order && value !== orderPickerLabel(order)) {
        setSelectedRef("")
      }
    }
  }

  if (sendableOrders.length === 0) {
    return (
      <EmptyState
        title="No orders to email"
        message="Paid orders need a customer email."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div ref={rootRef} className="relative">
        <label className="block">
          <span className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
            Order
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setListOpen(true)}
            placeholder="Search…"
            autoComplete="off"
            role="combobox"
            aria-expanded={listOpen && suggestions.length > 0}
            aria-controls="messages-order-suggestions"
            className="mt-1 w-full rounded-soft border border-oatmeal/80 bg-warm-white px-4 py-3 text-espresso font-body text-base shadow-gentle focus:border-sage"
          />
        </label>

        {listOpen && suggestions.length > 0 ? (
          <ul
            id="messages-order-suggestions"
            role="listbox"
            className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-soft border border-espresso/15 bg-warm-white shadow-warm divide-y divide-espresso/10"
          >
            {suggestions.map((order) => (
              <li
                key={order.internalRef}
                role="option"
                aria-selected={selectedRef === order.internalRef}
              >
                <button
                  type="button"
                  className={`w-full text-left px-4 py-3 text-sm font-body hover:bg-linen transition-colors ${
                    selectedRef === order.internalRef ? "bg-linen/80" : ""
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOrder(order)}
                >
                  <span className="font-semibold text-espresso block truncate">
                    {order.customerName || order.customerEmail}
                  </span>
                  <span className="text-caption text-xs mt-0.5 block truncate">
                    {order.internalRef} · {formatMethod(order.fulfillmentMethod)}
                    {order.customerEmail ? ` · ${order.customerEmail}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {listOpen && query.trim() && suggestions.length === 0 ? (
          <p className="absolute z-20 left-0 right-0 mt-1 rounded-soft border border-oatmeal/60 bg-warm-white px-4 py-3 text-sm text-caption font-body shadow-gentle">
            No match for &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : null}
      </div>

      {selectedOrder ? (
        <AdminOrderCustomerEmail
          key={selectedOrder.internalRef}
          order={selectedOrder}
          initialHistory={[]}
          showHistory={false}
          embedded
          onEmailSent={handleEmailSent}
        />
      ) : null}

      <p className="text-caption text-sm font-body">
        {batchLabel} · Bulk:{" "}
        <a href="/admin/pickup" className="text-espresso font-semibold underline">
          Pickup
        </a>
        {" · "}
        <a
          href="/admin/deliveries"
          className="text-espresso font-semibold underline"
        >
          Deliveries
        </a>
      </p>
    </div>
  )
}
