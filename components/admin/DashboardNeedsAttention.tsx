import Link from "next/link"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import {
  buildDashboardAttention,
  type AttentionPriority,
  type DashboardAttentionItem,
} from "@/lib/admin/dashboard-attention"
import type { DashboardStats } from "@/lib/admin/dashboard-stats"

interface DashboardNeedsAttentionProps {
  stats: DashboardStats
}

const priorityStyles: Record<
  AttentionPriority,
  { border: string; bg: string; hover: string; action: string }
> = {
  critical: {
    border: "border-red-300/80",
    bg: "bg-red-50/90",
    hover: "hover:bg-red-50 hover:border-red-400/70",
    action: "text-red-900",
  },
  high: {
    border: "border-terracotta/50",
    bg: "bg-terracotta/10",
    hover: "hover:bg-terracotta/15 hover:border-terracotta/65",
    action: "text-terracotta",
  },
  medium: {
    border: "border-espresso/20",
    bg: "bg-linen/50",
    hover: "hover:bg-linen/80 hover:border-espresso/30",
    action: "text-espresso",
  },
}

function AttentionCard({
  item,
  variant,
}: {
  item: DashboardAttentionItem
  variant: "featured" | "secondary"
}) {
  const isFeatured = variant === "featured"
  const styles = isFeatured
    ? {
        border: "border-transparent",
        bg: "bg-transparent",
        hover: "hover:bg-amber-50/40",
        action: "text-espresso",
      }
    : priorityStyles[item.priority]

  return (
    <Link
      href={item.href}
      className={`group block h-full rounded-lg border transition-colors ${styles.border} ${styles.bg} ${styles.hover} ${
        isFeatured ? "px-5 py-4 sm:px-6 sm:py-5" : "px-4 py-3.5"
      }`}
    >
      <p
        className={`font-semibold text-espresso leading-snug ${
          isFeatured ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
        }`}
      >
        {item.headline}
      </p>
      <p
        className={`text-charcoal/75 mt-1.5 leading-relaxed ${
          isFeatured ? "text-sm sm:text-base" : "text-sm"
        }`}
      >
        {item.context}
      </p>
      <p
        className={`mt-3 text-sm font-semibold ${styles.action} group-hover:underline underline-offset-2`}
      >
        {item.actionLabel} →
      </p>
    </Link>
  )
}

export default function DashboardNeedsAttention({
  stats,
}: DashboardNeedsAttentionProps) {
  const { featured, active, allClear } = buildDashboardAttention(stats)

  return (
    <DashboardCard
      title="Needs attention"
      subtitle="Action required today"
      className="border-espresso/25"
    >
      <div className="space-y-4">
        <div className="rounded-lg border-2 border-amber-400/55 bg-gradient-to-br from-amber-50/95 via-warm-white to-linen/40 shadow-sm">
          <AttentionCard item={featured} variant="featured" />
        </div>

        {active.length > 0 ? (
          <ul
            className={`grid gap-3 ${
              active.length === 1
                ? "grid-cols-1"
                : active.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {active.map((item) => (
              <li key={item.id}>
                <AttentionCard item={item} variant="secondary" />
              </li>
            ))}
          </ul>
        ) : null}

        {allClear.length > 0 ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-charcoal/55">
            {allClear.map((line) => (
              <span key={line} className="inline-flex items-center gap-1.5">
                <span className="text-sage-deep/80" aria-hidden>
                  ✓
                </span>
                {line}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </DashboardCard>
  )
}
