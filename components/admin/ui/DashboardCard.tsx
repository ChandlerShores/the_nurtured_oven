import type { ReactNode } from "react"

interface DashboardCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export default function DashboardCard({
  title,
  subtitle,
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <section
      className={`rounded-lg bg-warm-white border border-espresso/15 shadow-gentle p-5 sm:p-6 ${className}`}
    >
      <header className="mb-4">
        <h2 className="font-heading text-lg sm:text-xl text-espresso">{title}</h2>
        {subtitle ? (
          <p className="text-caption text-sm mt-1">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}
