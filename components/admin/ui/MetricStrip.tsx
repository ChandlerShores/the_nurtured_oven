import MetricCard, { type MetricDefinition } from "@/components/admin/ui/MetricCard"

export type { MetricDefinition }

interface MetricStripProps {
  metrics: MetricDefinition[]
  className?: string
}

function gridClass(count: number): string {
  if (count <= 1) return "grid-cols-1 max-w-[11rem]"
  if (count === 2) return "grid-cols-2 max-w-md"
  if (count === 3) return "grid-cols-1 sm:grid-cols-3 max-w-3xl"
  if (count === 4) return "grid-cols-2 max-w-2xl lg:max-w-4xl lg:grid-cols-4"
  if (count === 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-4xl"
  return "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 max-w-6xl"
}

export default function MetricStrip({
  metrics,
  className = "",
}: MetricStripProps) {
  if (metrics.length === 0) return null

  return (
    <div
      className={`flex w-full justify-center ${className}`}
      role="group"
      aria-label="Summary statistics"
    >
      <dl
        className={`grid w-full ${gridClass(metrics.length)} gap-3 sm:gap-4`}
      >
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0">
            <MetricCard {...metric} />
          </div>
        ))}
      </dl>
    </div>
  )
}
