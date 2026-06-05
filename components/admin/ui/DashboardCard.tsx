import type { ReactNode } from "react"

interface DashboardCardProps {
  title?: string
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
      className={`rounded-lg bg-warm-white border border-espresso/12 p-5 sm:p-6 ${className}`}
    >
      {title || subtitle ? (
        <header className="mb-4">
          {title ? (
            <h2 className="font-heading text-lg text-espresso">{title}</h2>
          ) : null}
          {subtitle ? (
            <p className="text-caption text-sm mt-1">{subtitle}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
