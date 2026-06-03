"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { calculateOrderTotalCentsFromCatalog } from "@/lib/order/cart-totals"
import { fulfillmentPolicy } from "@/lib/content/fulfillment"
import type { CatalogItem } from "@/lib/order/catalog-types"

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

interface WeeklyOrderCartProps {
  catalog: CatalogItem[]
  featuredSlug: string
  prefillSlug?: string
  onQuantitiesChange?: (items: { slug: string; quantity: number }[]) => void
  fulfillment?: "pickup" | "delivery"
  /** Polished rows with thumbnails for the contact page */
  variant?: "default" | "contact"
}

export default function WeeklyOrderCart({
  catalog,
  featuredSlug,
  prefillSlug,
  onQuantitiesChange,
  fulfillment = "pickup",
  variant = "default",
}: WeeklyOrderCartProps) {
  const isContact = variant === "contact"

  const initialQuantities = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of catalog) {
      map[item.slug] = item.slug === prefillSlug ? 1 : 0
    }
    return map
  }, [catalog, prefillSlug])

  const [quantities, setQuantities] = useState<Record<string, number>>(
    initialQuantities
  )

  function setQty(slug: string, qty: number) {
    const next = Math.max(0, Math.min(20, qty))
    setQuantities((prev) => ({ ...prev, [slug]: next }))
  }

  useEffect(() => {
    onQuantitiesChange?.(
      Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([slug, quantity]) => ({ slug, quantity }))
    )
  }, [quantities, onQuantitiesChange])

  const lineItems = Object.entries(quantities)
    .filter(([, q]) => q > 0)
    .map(([slug, quantity]) => ({ slug, quantity }))

  const { subtotalCents, deliveryFeeCents, totalCents } =
    calculateOrderTotalCentsFromCatalog(lineItems, fulfillment, catalog, {
      freeDeliveryMinimumCents: fulfillmentPolicy.freeDeliveryMinimumCents,
      deliveryFeeCents: fulfillmentPolicy.deliveryFeeCents,
    })

  const comfortSlug = featuredSlug

  const qtyButtonClass = isContact
    ? "w-10 h-10 rounded-full border text-espresso font-body text-lg leading-none transition-colors disabled:opacity-40"
    : "w-9 h-9 rounded-full border border-linen/60 text-espresso hover:bg-oatmeal/60 transition-colors disabled:opacity-40"

  return (
    <div className="space-y-4">
      {!isContact && (
        <p className="text-muted-sm text-sm font-body">
          Select quantities for this week&apos;s menu. You&apos;ll pay securely
          with Square at checkout.
        </p>
      )}

      <ul className="space-y-3" aria-label="Menu items">
        {catalog.map((item) => {
          const qty = quantities[item.slug] ?? 0
          const isComfort = item.slug === comfortSlug

          return (
            <li
              key={item.slug}
              className={`flex items-center gap-3 sm:gap-4 rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5 ${
                isComfort
                  ? "border-blush/40 bg-blush/5"
                  : "border-linen/50 bg-cream/40"
              }`}
            >
              {isContact && item.image && (
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border border-linen/40 bg-oatmeal/40">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-heading text-espresso text-base tracking-wide leading-snug">
                  {item.name}
                  {isComfort && (
                    <span className="ml-2 text-xs font-body text-blush font-normal">
                      Featured
                    </span>
                  )}
                </p>
                <p className="text-muted text-sm font-body mt-0.5">
                  {formatCents(item.priceCents)}
                  {item.unitLabel ? ` / ${item.unitLabel}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  aria-label={`Decrease ${item.name}`}
                  className={`${qtyButtonClass} border-linen/60 hover:bg-oatmeal/60`}
                  onClick={() => setQty(item.slug, qty - 1)}
                  disabled={qty === 0}
                >
                  −
                </button>
                <span
                  className="w-8 sm:w-9 text-center font-body text-espresso tabular-nums text-base"
                  aria-live="polite"
                  aria-label={`Quantity: ${qty}`}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${item.name}`}
                  className={`${qtyButtonClass} border-olive/40 bg-olive/10 hover:bg-olive/20`}
                  onClick={() => setQty(item.slug, qty + 1)}
                >
                  +
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {lineItems.length > 0 && (
        <div className="text-right text-sm font-body text-muted pt-1 space-y-1">
          <p>
            Subtotal:{" "}
            <span className="font-heading text-espresso text-base">
              {formatCents(subtotalCents)}
            </span>
          </p>
          {fulfillment === "delivery" && (
            <p>
              Delivery:{" "}
              <span className="font-heading text-espresso text-base">
                {deliveryFeeCents === 0
                  ? "Free (order $40+)"
                  : formatCents(deliveryFeeCents)}
              </span>
            </p>
          )}
          <p className="text-espresso">
            Estimated total:{" "}
            <span className="font-heading text-espresso text-base">
              {formatCents(totalCents)}
            </span>
          </p>
        </div>
      )}

      {lineItems.length === 0 && (
        <p
          id="weekly-order-cart-status"
          role="status"
          aria-live="polite"
          className="text-center text-sm text-muted font-body py-2"
        >
          Add at least one item to continue.
        </p>
      )}
    </div>
  )
}
