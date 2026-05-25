"use client"

import { useId, useState } from "react"

export interface AccordionItem {
  id?: string
  question: string
  answer: string
}

interface AccordionProps {
  items: AccordionItem[]
  /** Allow multiple panels open at once */
  allowMultiple?: boolean
  className?: string
  itemClassName?: string
  buttonClassName?: string
  panelClassName?: string
  answerClassName?: string
}

export default function Accordion({
  items,
  allowMultiple = false,
  className = "space-y-3",
  itemClassName = "border border-linen/40 rounded-xl overflow-hidden bg-warm-white shadow-gentle",
  buttonClassName = "w-full flex items-center justify-between p-5 text-left hover:bg-oatmeal/20 transition-colors",
  panelClassName = "px-5 pb-5",
  answerClassName = "text-muted leading-relaxed font-body text-sm",
}: AccordionProps) {
  const baseId = useId()
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set())

  function toggle(index: number) {
    setOpenIndices((prev) => {
      const next = new Set(allowMultiple ? prev : [])
      if (prev.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className={className}>
      {items.map((item, i) => {
        const isOpen = openIndices.has(i)
        const buttonId = `${baseId}-button-${i}`
        const panelId = `${baseId}-panel-${i}`

        return (
          <div key={item.id ?? i} className={itemClassName}>
            <button
              type="button"
              id={buttonId}
              className={buttonClassName}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(i)}
            >
              <span className="font-heading text-base sm:text-lg text-espresso pr-4 tracking-wide">
                {item.question}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                className={`text-caption shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={isOpen ? panelClassName : undefined}
            >
              {isOpen && (
                <p className={answerClassName}>{item.answer}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
