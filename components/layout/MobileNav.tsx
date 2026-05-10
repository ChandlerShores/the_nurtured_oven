"use client"

import { useEffect } from "react"
import Link from "next/link"
import { siteConfig } from "@/lib/content/site"
import SocialIcons from "@/components/ui/SocialIcons"
import Button from "@/components/ui/Button"

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-espresso/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-cream z-50 shadow-warm transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-linen/40">
          <div>
            <span className="font-heading text-lg text-espresso tracking-wide">
              {siteConfig.brandName}
            </span>
            <span className="block font-accent text-xs text-brown-sugar/50">fresh-baked happiness</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-brown-sugar/60 hover:text-espresso transition-colors"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-6 gap-1">
          {siteConfig.nav.map((item) => (
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
          <Button href="/contact" className="w-full" onClick={onClose}>
            Request an Order
          </Button>
          <div className="flex justify-center">
            <SocialIcons iconSize={20} />
          </div>
        </div>
      </div>
    </>
  )
}
