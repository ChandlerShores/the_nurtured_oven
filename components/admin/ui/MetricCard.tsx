export interface MetricDefinition {
  label: string
  value: string | number
  hint?: string
}

type MetricCardProps = MetricDefinition

export default function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="flex h-full min-h-[5.25rem] flex-col items-center justify-center rounded-xl border border-oatmeal/80 bg-warm-white px-4 py-5 text-center shadow-[0_1px_2px_rgba(58,47,42,0.05),0_4px_14px_rgba(58,47,42,0.04)] sm:min-h-[5.75rem] sm:px-5 sm:py-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-espresso/50 font-body leading-tight">
        {label}
      </p>
      <p className="font-heading text-2xl sm:text-[1.75rem] text-espresso tabular-nums mt-2 leading-none break-words max-w-full">
        {value}
      </p>
      {hint ? (
        <p className="text-xs text-espresso/55 mt-2 leading-snug max-w-full">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
