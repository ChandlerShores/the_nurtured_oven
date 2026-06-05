"use client"

import { useCallback, useEffect, useId, useState, type ReactNode } from "react"

/** In-page anchor for Financials weekly goals editor. */
export const FINANCIALS_WEEKLY_GOALS_SECTION_ID = "weekly-goals"

interface AdminPortalSectionProps {
  title: string
  /** Shown after the title, e.g. counts */
  titleSuffix?: string
  subtitle?: string
  children: ReactNode
  /** Omit top rule for the first block on the page. */
  first?: boolean
  /** Stable id for in-page links. Defaults from title. */
  anchorId?: string
  /** Show expand/collapse on the section body. Defaults to true. */
  collapsible?: boolean
  /** Initial open state when uncontrolled. Defaults to true. */
  defaultOpen?: boolean
  /** Controlled open state (e.g. collapse all on Menu). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

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

export default function AdminPortalSection({
  title,
  titleSuffix,
  subtitle,
  children,
  first = false,
  anchorId,
  collapsible = true,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
}: AdminPortalSectionProps) {
  const sectionId =
    anchorId ?? title.toLowerCase().replace(/\s+/g, "-")
  const headingId = `${sectionId}-heading`
  const panelId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  useEffect(() => {
    if (!collapsible || typeof window === "undefined") return

    function expandIfHashMatches() {
      const hash = window.location.hash.slice(1)
      if (hash && hash === sectionId) setOpen(true)
    }

    expandIfHashMatches()
    window.addEventListener("hashchange", expandIfHashMatches)
    return () => window.removeEventListener("hashchange", expandIfHashMatches)
  }, [collapsible, sectionId, setOpen])

  const sectionClass = `scroll-mt-24 ${
    first
      ? "space-y-5 sm:space-y-6"
      : "space-y-5 sm:space-y-6 pt-8 sm:pt-10 mt-2 border-t-2 border-espresso/12"
  }`

  if (!collapsible) {
    return (
      <section
        id={sectionId}
        aria-labelledby={headingId}
        className={sectionClass}
      >
        <header className="flex flex-col gap-1 pb-1">
          <h2
            id={headingId}
            className="font-heading text-lg sm:text-xl text-espresso tracking-tight"
          >
            {title}
            {titleSuffix ? (
              <span className="text-espresso/70 font-body text-base font-semibold">
                {" "}
                {titleSuffix}
              </span>
            ) : null}
          </h2>
          {subtitle ? (
            <p className="text-caption text-sm max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </header>
        <div className="space-y-5 sm:space-y-6">{children}</div>
      </section>
    )
  }

  return (
    <section id={sectionId} aria-labelledby={headingId} className={sectionClass}>
      <header className="pb-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-start gap-3 text-left group rounded-md -mx-1 px-1 py-0.5 hover:bg-linen/40 transition-colors"
          aria-expanded={open}
          aria-controls={panelId}
        >
          <Chevron open={open} />
          <span className="flex-1 min-w-0 flex flex-col gap-1">
            <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2
                id={headingId}
                className="font-heading text-lg sm:text-xl text-espresso tracking-tight"
              >
                {title}
                {titleSuffix ? (
                  <span className="text-espresso/70 font-body text-base font-semibold">
                    {" "}
                    {titleSuffix}
                  </span>
                ) : null}
              </h2>
              <span className="text-caption text-xs sm:text-sm font-body shrink-0 text-espresso/55 group-hover:text-espresso/80">
                {open ? "Collapse" : "Expand"}
              </span>
            </span>
            {subtitle ? (
              <p className="text-caption text-sm max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            ) : null}
          </span>
        </button>
      </header>
      {open ? (
        <div id={panelId} className="space-y-5 sm:space-y-6">
          {children}
        </div>
      ) : null}
    </section>
  )
}
