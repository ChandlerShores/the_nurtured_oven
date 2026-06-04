const STATUS_STYLES: Record<string, string> = {
  New: "bg-blush/30 text-espresso border-blush",
  Baking: "bg-warm-honey/30 text-espresso border-warm-honey",
  Packed: "bg-sage/40 text-espresso border-sage-deep/50",
  Ready: "bg-sage-deep text-cream border-sage-deep",
  Delivered: "bg-olive text-cream border-olive",
  "Delivered / Picked Up": "bg-olive text-cream border-olive",
  Complete: "bg-charcoal text-cream border-charcoal",
  Cancelled: "bg-oatmeal text-espresso border-espresso/25",
  Issue: "bg-terracotta text-cream border-terracotta",
  Refunded: "bg-linen text-espresso border-espresso/25",
  Paid: "bg-sage-deep text-cream border-sage-deep",
  Active: "bg-sage-deep text-cream border-sage-deep",
  Hidden: "bg-oatmeal text-espresso border-espresso/25",
  Featured: "bg-blush text-cream border-blush",
  "Sold out": "bg-terracotta text-cream border-terracotta",
  "Missing data": "bg-terracotta text-cream border-terracotta",
  Unpaid: "bg-terracotta/20 text-espresso border-terracotta",
}

const DOT_STYLES: Record<string, string> = {
  New: "bg-blush",
  Baking: "bg-warm-honey",
  Packed: "bg-sage",
  Ready: "bg-sage-deep",
  Delivered: "bg-olive",
  "Delivered / Picked Up": "bg-olive",
  Complete: "bg-oatmeal",
  Cancelled: "bg-oatmeal",
  Issue: "bg-terracotta",
  Refunded: "bg-olive",
  Paid: "bg-sage-deep",
  Active: "bg-sage",
  Hidden: "bg-oatmeal",
  Featured: "bg-blush",
  "Sold out": "bg-terracotta",
  "Missing data": "bg-terracotta",
  Unpaid: "bg-terracotta",
}

interface StatusPillProps {
  status: string
  showDot?: boolean
}

export default function StatusPill({ status, showDot = false }: StatusPillProps) {
  const label = status.trim() || "New"
  const style = STATUS_STYLES[label] ?? "bg-linen text-espresso border-espresso/20"
  const dot = DOT_STYLES[label] ?? "bg-oatmeal"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-body leading-none ${style}`}
    >
      {showDot ? (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} aria-hidden />
      ) : null}
      {label}
    </span>
  )
}

export function StatusDot({ status }: { status: string }) {
  const label = status.trim() || "New"
  const dot = DOT_STYLES[label] ?? "bg-oatmeal"
  return <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} aria-hidden />
}

export function statusControlClass(status: string): string {
  const label = status.trim()
  if (label === "Ready" || label === "Paid" || label === "Active") {
    return "border-sage-deep bg-sage-deep/10 text-espresso"
  }
  if (label === "Delivered" || label === "Delivered / Picked Up" || label === "Complete") {
    return "border-olive bg-olive/10 text-espresso"
  }
  if (label === "Issue" || label === "Missing data" || label === "Unpaid") {
    return "border-terracotta bg-terracotta/10 text-espresso"
  }
  if (label === "Baking") return "border-warm-honey bg-warm-honey/15 text-espresso"
  if (label === "New") return "border-blush bg-blush/15 text-espresso"
  return "border-espresso/25 bg-warm-white text-espresso"
}
