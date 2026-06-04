"use client"

import { useId, useState } from "react"

interface AdminCollapsibleSectionProps {
  title: string
  /** Shown in the heading after the title, e.g. counts */
  titleSuffix?: string
  subtitle?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

export default function AdminCollapsibleSection({
  title,
  titleSuffix,
  subtitle,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  className = "mb-7",
  children,
}: AdminCollapsibleSectionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const panelId = useId()

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <section className={className}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex flex-wrap items-center justify-between gap-2 font-heading text-xl text-espresso mb-3 text-left group"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>
          {title}
          {titleSuffix ? (
            <span className="text-espresso/70 font-body text-base font-semibold">
              {" "}
              {titleSuffix}
            </span>
          ) : null}
        </span>
        <span className="text-caption text-sm font-body shrink-0 group-hover:text-espresso">
          {open ? "Collapse" : "Expand"}
        </span>
      </button>
      {subtitle && open ? (
        <p className="text-caption text-sm -mt-2 mb-3">{subtitle}</p>
      ) : null}
      {open ? (
        <div id={panelId}>{children}</div>
      ) : null}
    </section>
  )
}
