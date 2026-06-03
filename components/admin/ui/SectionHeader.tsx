import type { ReactNode } from "react"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function SectionHeader({
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl text-charcoal">{title}</h1>
        {subtitle ? (
          <p className="text-caption text-sm sm:text-base mt-2 max-w-2xl text-olive/90">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
