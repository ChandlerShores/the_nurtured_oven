"use client"

import { useCallback, useEffect, useMemo, useState, type DragEvent } from "react"
import { useRouter } from "next/navigation"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import MetricStrip from "@/components/admin/ui/MetricStrip"
import EmptyState from "@/components/admin/ui/EmptyState"
import StatusPill from "@/components/admin/ui/StatusPill"
import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import { adminOrderKey } from "@/lib/admin/order-filters"
import type { OrderStatus } from "@/lib/admin/order-status"
import { BAKERY_BASE_ADDRESS } from "@/lib/delivery/bakery-base"
import { formatDeliveryAddress } from "@/lib/delivery/address"
import {
  isActiveDeliveryStop,
  isPaidDeliveryOrder,
} from "@/lib/delivery/delivery-orders"
import { buildGoogleMapsRouteUrl } from "@/lib/delivery/google-maps-url"
import type {
  DeliveryRouteStopView,
  OptimizeDeliveryRouteResponse,
} from "@/lib/delivery/route-types"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

interface DeliveryRouteBuilderProps {
  orders: AdminOrderRow[]
  batchLabel: string
  fulfillmentDate: string
  onMarkDelivered: (order: AdminOrderRow) => Promise<void>
  savingRef: string | null
}

function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters <= 0) return "—"
  const miles = meters / 1609.344
  if (miles < 10) return `${miles.toFixed(1)} mi`
  return `${Math.round(miles)} mi`
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  return rem > 0 ? `${hours} hr ${rem} min` : `${hours} hr`
}

function buildInitialStops(orders: AdminOrderRow[]): DeliveryRouteStopView[] {
  return orders
    .filter(
      (order) =>
        isPaidDeliveryOrder(order) && isActiveDeliveryStop(order.orderStatus)
    )
    .sort((a, b) => {
      if (a.routeOrder != null && b.routeOrder != null) {
        return a.routeOrder - b.routeOrder
      }
      if (a.routeOrder != null) return -1
      if (b.routeOrder != null) return 1
      return a.sheetRow - b.sheetRow
    })
    .map((order, index) => ({
      sheetRow: order.sheetRow,
      internalRef: order.internalRef,
      squareOrderId: order.squareOrderId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryZip: order.deliveryZip,
      itemsSummary: order.itemsSummary,
      orderStatus: order.orderStatus,
      lat: null,
      lng: null,
      routeOrder: order.routeOrder,
      routeBatchId: order.routeBatchId,
      sequence: index + 1,
      geocodeStatus: "missing_address",
    }))
}

function resequenceStops(stops: DeliveryRouteStopView[]): DeliveryRouteStopView[] {
  return stops.map((stop, index) => ({ ...stop, sequence: index + 1 }))
}

export default function DeliveryRouteBuilder({
  orders,
  batchLabel,
  fulfillmentDate,
  onMarkDelivered,
  savingRef,
}: DeliveryRouteBuilderProps) {
  const router = useRouter()
  const initialStops = useMemo(() => buildInitialStops(orders), [orders])
  const [stops, setStops] = useState<DeliveryRouteStopView[]>(initialStops)
  const [routeBatchId, setRouteBatchId] = useState<string>("")
  const [optimized, setOptimized] = useState(false)
  const [summary, setSummary] = useState<
    OptimizeDeliveryRouteResponse["summary"]
  >(null)
  const [failedStops, setFailedStops] = useState<
    OptimizeDeliveryRouteResponse["failedStops"]
  >([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [routeError, setRouteError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [optimizing, setOptimizing] = useState(false)
  const [locking, setLocking] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [allowDragReorder, setAllowDragReorder] = useState(false)

  useEffect(() => {
    setStops(initialStops)
  }, [initialStops])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const update = () => setAllowDragReorder(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const googleMapsUrl = useMemo(
    () =>
      buildGoogleMapsRouteUrl(
        stops.filter((stop) => stop.deliveryAddress.trim())
      ),
    [stops]
  )

  const resetFromOrders = useCallback(() => {
    setStops(buildInitialStops(orders))
    setOptimized(false)
    setSummary(null)
    setFailedStops([])
    setWarnings([])
    setRouteError(null)
    setInfoMessage(null)
    setRouteBatchId("")
  }, [orders])

  async function handleOptimize() {
    setOptimizing(true)
    setRouteError(null)
    setInfoMessage(null)
    setWarnings([])

    try {
      const res = await fetch("/api/admin/deliveries/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryDate: fulfillmentDate }),
      })

      const data = (await res.json()) as OptimizeDeliveryRouteResponse & {
        error?: string
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not optimize route.")
      }

      setStops(resequenceStops(data.stops))
      setRouteBatchId(data.routeBatchId)
      setOptimized(data.optimized)
      setSummary(data.summary)
      setFailedStops(data.failedStops)
      setWarnings(data.warnings)
      setRouteError(data.error)

      if (data.optimized) {
        setInfoMessage(
          `Route optimized from ${BAKERY_BASE_ADDRESS}. Drag stops to adjust, then lock the route.`
        )
      } else if (data.error) {
        setInfoMessage("Showing unoptimized stops. Use Google Maps or fix issues below.")
      }
    } catch (err) {
      setRouteError(
        err instanceof Error ? err.message : "Could not optimize route."
      )
      resetFromOrders()
    } finally {
      setOptimizing(false)
    }
  }

  async function handleLockRoute() {
    if (stops.length === 0) {
      setRouteError("Add at least one delivery stop before locking the route.")
      return
    }

    if (!routeBatchId) {
      setRouteBatchId(`TNO-ROUTE-${fulfillmentDate}-MANUAL`)
    }

    const batchId = routeBatchId || `TNO-ROUTE-${fulfillmentDate}-MANUAL`

    setLocking(true)
    setRouteError(null)

    try {
      const res = await fetch("/api/admin/deliveries/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryDate: fulfillmentDate,
          routeBatchId: batchId,
          stops: stops.map((stop) => ({
            sheetRow: stop.sheetRow,
            sequence: stop.sequence,
          })),
        }),
      })

      const data = (await res.json()) as { error?: string; ok?: boolean }
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not lock route.")
      }

      setInfoMessage(`Route locked for ${batchLabel}.`)
      router.refresh()
    } catch (err) {
      setRouteError(
        err instanceof Error ? err.message : "Could not lock route."
      )
    } finally {
      setLocking(false)
    }
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function moveStop(index: number, direction: -1 | 1) {
    setStops((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target]!, next[index]!]
      return resequenceStops(next)
    })
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    setStops((current) => {
      const next = [...current]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index, 0, moved!)
      setDragIndex(index)
      return resequenceStops(next)
    })
  }

  function handleDragEnd() {
    setDragIndex(null)
  }

  function findOrderForStop(stop: DeliveryRouteStopView): AdminOrderRow | undefined {
    return orders.find((order) => order.sheetRow === stop.sheetRow)
  }

  return (
    <DashboardCard title="Delivery route builder">
      <div data-sop="delivery-route-builder">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={handleOptimize}
          disabled={optimizing || locking}
          className={`${adminBtnPrimary} w-full sm:w-auto`}
          data-sop="delivery-optimize-route"
        >
          {optimizing ? "Optimizing…" : "Optimize route"}
        </button>
        <button
          type="button"
          onClick={handleLockRoute}
          disabled={locking || optimizing || stops.length === 0}
          className={`${adminBtnSecondary} w-full sm:w-auto`}
          data-sop="delivery-lock-route"
        >
          {locking ? "Locking…" : "Lock route"}
        </button>
        {googleMapsUrl ? (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${adminBtnSecondary} w-full sm:w-auto text-center`}
            data-sop="delivery-open-maps"
          >
            Open in Google Maps
          </a>
        ) : null}
      </div>

      {infoMessage ? (
        <p className="text-sm text-espresso/80 bg-linen/60 border border-espresso/10 rounded-soft px-3 py-2 mb-3">
          {infoMessage}
        </p>
      ) : null}

      {routeError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-3 py-2 mb-3">
          {routeError}
        </p>
      ) : null}

      {warnings.map((warning) => (
        <p
          key={warning}
          className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-soft px-3 py-2 mb-3"
        >
          {warning}
        </p>
      ))}

      {summary ? (
        <MetricStrip
          className="mb-4"
          metrics={[
            {
              label: "Drive time",
              value: formatDuration(summary.totalDurationSeconds),
            },
            {
              label: "Distance",
              value: formatDistance(summary.totalDistanceMeters),
            },
          ]}
        />
      ) : null}

      {optimized ? (
        <p className="text-xs text-espresso/60 mb-3">
          {allowDragReorder
            ? "Drag stops to reorder after optimization. Lock route when ready."
            : "Use the up/down buttons to reorder stops, then lock the route."}
        </p>
      ) : null}

      {stops.length === 0 ? (
        <EmptyState
          title="No active delivery stops"
          message="Paid delivery orders with addresses will appear here for routing."
        />
      ) : (
        <ul className="space-y-3">
          <li className="rounded-lg border border-espresso/20 bg-linen/50 px-4 py-3 text-sm shadow-gentle">
            <div className="flex items-start gap-2">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brown-sugar text-cream text-xs font-semibold">
                HQ
              </span>
              <div>
                <p className="font-semibold text-espresso">Start &amp; end here</p>
                <p className="mt-1 text-espresso/85">{BAKERY_BASE_ADDRESS}</p>
                <p className="mt-1 text-xs text-espresso/60">
                  Every optimized route leaves from and returns to the bakery.
                </p>
              </div>
            </div>
          </li>
          {stops.map((stop, index) => {
            const order = findOrderForStop(stop)
            const addressLabel = formatDeliveryAddress(
              stop.deliveryAddress,
              stop.deliveryCity,
              stop.deliveryZip
            )

            return (
              <li
                key={stop.sheetRow}
                data-sop="delivery-stop-card"
                draggable={allowDragReorder}
                onDragStart={
                  allowDragReorder ? () => handleDragStart(index) : undefined
                }
                onDragOver={
                  allowDragReorder
                    ? (event) => handleDragOver(event, index)
                    : undefined
                }
                onDragEnd={allowDragReorder ? handleDragEnd : undefined}
                className={`rounded-lg border border-espresso/15 bg-warm-white px-4 py-3 text-sm shadow-gentle ${
                  dragIndex === index ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-espresso text-cream text-sm font-semibold ${
                          allowDragReorder
                            ? "cursor-grab active:cursor-grabbing"
                            : ""
                        }`}
                        aria-hidden
                      >
                        {stop.sequence}
                      </span>
                      <p className="font-semibold text-espresso">
                        {stop.customerName || "Customer"}
                      </p>
                    </div>
                    <p className="text-caption mt-1">
                      {stop.itemsSummary || "—"}
                    </p>
                    {stop.deliveryAddress.trim() ? (
                      <p className="mt-2 text-espresso/85">{addressLabel}</p>
                    ) : (
                      <p className="mt-2 inline-flex rounded-full bg-terracotta/15 border border-terracotta/50 px-2 py-1 text-xs font-semibold text-espresso">
                        Address missing
                      </p>
                    )}
                    {stop.geocodeStatus === "failed" && stop.geocodeError ? (
                      <p className="mt-2 text-xs text-red-700">
                        {stop.geocodeError}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    {!allowDragReorder ? (
                      <div className="flex flex-col gap-1 md:hidden">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveStop(index, -1)}
                          className={`${adminBtnSecondary} px-3 py-2 min-h-0 text-xs`}
                          aria-label={`Move ${stop.customerName || "stop"} earlier`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === stops.length - 1}
                          onClick={() => moveStop(index, 1)}
                          className={`${adminBtnSecondary} px-3 py-2 min-h-0 text-xs`}
                          aria-label={`Move ${stop.customerName || "stop"} later`}
                        >
                          ↓
                        </button>
                      </div>
                    ) : null}
                    <StatusPill status={(stop.orderStatus || "New") as OrderStatus} />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-3 sm:flex-row sm:flex-wrap">
                  {stop.deliveryAddress.trim() ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLabel)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${adminBtnSecondary} w-full sm:w-auto text-center`}
                    >
                      Open in Maps
                    </a>
                  ) : null}
                  {order && isActiveDeliveryStop(stop.orderStatus) ? (
                    <button
                      type="button"
                      disabled={savingRef === adminOrderKey(order)}
                      onClick={() => onMarkDelivered(order)}
                      className={`${adminBtnPrimary} w-full sm:w-auto`}
                      data-sop="delivery-mark-delivered"
                    >
                      {savingRef === adminOrderKey(order)
                        ? "Saving…"
                        : "Mark delivered"}
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {failedStops.length > 0 ? (
        <div className="mt-5 rounded-soft border border-blush/40 bg-blush/10 px-4 py-3">
          <p className="text-sm font-semibold text-espresso mb-2">
            Addresses that could not be routed
          </p>
          <ul className="space-y-2 text-sm">
            {failedStops.map((failed) => (
              <li key={failed.sheetRow}>
                <span className="font-semibold">
                  {failed.customerName || "Customer"}
                </span>
                {": "}
                {formatDeliveryAddress(
                  failed.deliveryAddress,
                  failed.deliveryCity
                ) || "No address"}
                {" — "}
                {failed.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      </div>
    </DashboardCard>
  )
}
