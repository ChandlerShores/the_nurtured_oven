"use client"

import { useId, useState, type ReactNode } from "react"

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-5 w-5 shrink-0 text-espresso/55 transition-transform duration-200 ${
        open ? "rotate-0" : "-rotate-90"
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

interface AdminCollapsibleFiltersProps {
  title?: string
  /** Shown beside the title when collapsed (e.g. active filter hint). */
  summary?: string
  /** When true, panel starts expanded. Defaults to true. */
  defaultOpen?: boolean
  /** When true, header shows an “active” hint if summary is omitted. */
  hasActiveFilters?: boolean
  bordered?: boolean
  className?: string
  children: ReactNode
}

export default function AdminCollapsibleFilters({
  title = "Search & filters",
  summary,
  defaultOpen = true,
  hasActiveFilters = false,
  bordered = true,
  className = "",
  children,
}: AdminCollapsibleFiltersProps) {
  const panelId = useId()
  const [open, setOpen] = useState(defaultOpen)

  const collapsedHint =
    summary ?? (hasActiveFilters ? "Filters active" : undefined)

  const shellClass = bordered
    ? "rounded-soft border border-oatmeal/60 bg-linen/30"
    : ""

  return (
    <div className={`${shellClass} ${className}`.trim()}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 text-left group transition-colors hover:bg-linen/50 ${
          bordered ? "px-4 py-3 rounded-soft" : "py-1"
        }`}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <Chevron open={open} />
        <span className="flex-1 min-w-0 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="font-body text-sm font-semibold text-espresso">
            {title}
            {!open && collapsedHint ? (
              <span className="ml-2 font-normal text-caption text-xs">
                {collapsedHint}
              </span>
            ) : null}
          </span>
          <span className="text-caption text-xs shrink-0 text-espresso/55 group-hover:text-espresso/80">
            {open ? "Collapse" : "Expand"}
          </span>
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          className={bordered ? "px-4 pb-4 pt-0 space-y-3" : "pt-3 space-y-3"}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
