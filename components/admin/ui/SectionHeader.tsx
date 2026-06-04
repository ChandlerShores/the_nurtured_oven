import type { ReactNode } from "react"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  secondaryAction?: ReactNode
}

export default function SectionHeader({
  title,
  subtitle,
  action,
  secondaryAction,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 border-b border-espresso/15 pb-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="font-heading text-2xl sm:text-3xl text-espresso">{title}</h1>
        {subtitle ? (
          <p className="text-caption text-sm sm:text-base mt-2 max-w-2xl break-words">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action || secondaryAction ? (
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:shrink-0 [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
          {secondaryAction}
          {action}
        </div>
      ) : null}
    </div>
  )
}
