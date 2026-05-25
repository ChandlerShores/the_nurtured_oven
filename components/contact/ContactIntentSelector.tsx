"use client"

import { useCallback, type KeyboardEvent, type ReactNode } from "react"
import {
  AskQuestionIcon,
  ComfortBoxIcon,
  MenuRemindersIcon,
  OrderThisWeekIcon,
} from "@/components/contact/NurturedOvenIcons"

export type ContactIntent = "weekly-order" | "gift" | "reminder" | "general"

export interface ContactIntentOption {
  id: ContactIntent
  title: string
  description: string
  icon: ReactNode
}

export const contactIntentOptions: ContactIntentOption[] = [
  {
    id: "weekly-order",
    title: "Order This Week",
    description:
      "Choose from this week\u2019s menu for Friday pickup or delivery.",
    icon: <OrderThisWeekIcon />,
  },
  {
    id: "gift",
    title: "Request a Comfort Box",
    description: "Plan a gift box for a future date or occasion.",
    icon: <ComfortBoxIcon />,
  },
  {
    id: "reminder",
    title: "Get Menu Reminders",
    description: "Be the first to know when each weekly menu opens.",
    icon: <MenuRemindersIcon />,
  },
  {
    id: "general",
    title: "Ask a Question",
    description:
      "Delivery, allergies, future requests, or general contact.",
    icon: <AskQuestionIcon />,
  },
]

interface ContactIntentSelectorProps {
  options?: ContactIntentOption[]
  selected: ContactIntent
  onSelect: (intent: ContactIntent) => void
}

export default function ContactIntentSelector({
  options = contactIntentOptions,
  selected,
  onSelect,
}: ContactIntentSelectorProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const ids = options.map((o) => o.id)
      const index = ids.indexOf(selected)
      if (index < 0) return

      let next = index
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = (index + 1) % ids.length
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = (index - 1 + ids.length) % ids.length
      } else {
        return
      }

      e.preventDefault()
      onSelect(ids[next])
    },
    [options, selected, onSelect]
  )

  return (
    <div
      role="tablist"
      aria-label="What would you like to do?"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const isSelected = selected === option.id
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            id={`contact-tab-${option.id}`}
            aria-selected={isSelected}
            aria-controls="contact-form-panel"
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(option.id)}
            className={`text-left rounded-2xl border p-5 sm:p-6 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
              isSelected
                ? "border-olive/50 bg-olive/10 shadow-warm"
                : "border-linen/50 bg-warm-white shadow-gentle hover:border-olive/30 hover:bg-cream/80"
            }`}
          >
            <div className="mb-4 shrink-0">{option.icon}</div>
            <h3 className="font-heading text-lg text-espresso tracking-wide mb-1.5">
              {option.title}
            </h3>
            <p className="text-muted text-sm font-body leading-relaxed">
              {option.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
