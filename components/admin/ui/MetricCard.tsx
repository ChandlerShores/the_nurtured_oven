import type { ReactNode } from "react"

interface MetricCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}

export default function MetricCard({ label, value, hint, icon }: MetricCardProps) {
  return (
    <div className="rounded-lg bg-warm-white border border-espresso/15 shadow-gentle px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-espresso/70 font-semibold font-body">
          {label}
        </p>
        {icon ? (
          <span className="text-sage-deep shrink-0">{icon}</span>
        ) : null}
      </div>
      <p className="font-heading text-2xl sm:text-3xl text-espresso mt-2">{value}</p>
      {hint ? (
        <p className="text-caption text-xs mt-1.5 text-olive/80">{hint}</p>
      ) : null}
    </div>
  )
}
