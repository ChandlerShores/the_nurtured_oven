"use client"

import { useEffect, useRef, type RefObject } from "react"
import Link from "next/link"
import { siteConfig } from "@/lib/content/site"
import { getPublicNav } from "@/lib/content/launch"
import SocialIcons from "@/components/ui/SocialIcons"
import Button from "@/components/ui/Button"
import { useFocusTrap } from "@/hooks/useFocusTrap"

interface MobileNavProps {
  open: boolean
  onClose: () => void
  returnFocusRef?: RefObject<HTMLButtonElement | null>
}

export default function MobileNav({
  open,
  onClose,
  returnFocusRef,
}: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useFocusTrap({
    active: open,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
    returnFocusRef,
    onEscape: onClose,
  })

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-espresso/20 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        id="mobile-nav-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title"
        className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-cream z-50 shadow-warm"
      >
        <div className="flex items-center justify-between p-5 border-b border-linen/40">
          <div>
            <p
              id="mobile-nav-title"
              className="font-heading text-lg text-espresso tracking-wide"
            >
              {siteConfig.brandName}
            </p>
            <span className="block font-accent text-xs text-espresso/80">
              comfort sweets, made weekly
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 text-espresso hover:text-espresso/80 transition-colors"
            aria-label="Close menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col p-6 gap-1">
          {getPublicNav().map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="text-espresso/80 hover:text-espresso py-3 text-lg tracking-wide border-b border-linen/30 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-6 mt-4 space-y-6">
          <Button href="/menu" className="w-full" onClick={onClose}>
            {siteConfig.orderCta}
          </Button>
          <div className="flex justify-center">
            <SocialIcons iconSize={20} />
          </div>
        </div>
      </div>
    </>
  )
}
