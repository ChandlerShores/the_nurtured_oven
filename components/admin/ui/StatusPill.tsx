const STATUS_STYLES: Record<string, string> = {
  New: "bg-blush/25 text-espresso border-blush/40",
  Baking: "bg-warm-honey/25 text-espresso border-warm-honey/50",
  Packed: "bg-sage/30 text-charcoal border-sage/50",
  Ready: "bg-sage-deep/20 text-charcoal border-sage-deep/40",
  Delivered: "bg-olive/20 text-charcoal border-olive/40",
  Complete: "bg-oatmeal/60 text-charcoal border-oatmeal",
  Issue: "bg-terracotta/20 text-espresso border-terracotta/40",
  Refunded: "bg-linen text-olive border-oatmeal",
  Paid: "bg-sage/35 text-charcoal border-sage/50",
  Active: "bg-sage/30 text-charcoal border-sage/50",
  Hidden: "bg-linen text-olive border-oatmeal",
  Featured: "bg-blush/25 text-espresso border-blush/40",
}

const DOT_STYLES: Record<string, string> = {
  New: "bg-blush",
  Baking: "bg-warm-honey",
  Packed: "bg-sage",
  Ready: "bg-sage-deep",
  Delivered: "bg-olive",
  Complete: "bg-oatmeal",
  Issue: "bg-terracotta",
  Refunded: "bg-olive",
  Paid: "bg-sage-deep",
  Active: "bg-sage",
  Hidden: "bg-oatmeal",
  Featured: "bg-blush",
}

interface StatusPillProps {
  status: string
  showDot?: boolean
}

export default function StatusPill({ status, showDot = false }: StatusPillProps) {
  const label = status.trim() || "New"
  const style = STATUS_STYLES[label] ?? "bg-linen text-charcoal border-oatmeal/60"
  const dot = DOT_STYLES[label] ?? "bg-oatmeal"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium font-body ${style}`}
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
