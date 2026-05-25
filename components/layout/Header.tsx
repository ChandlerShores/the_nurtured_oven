"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/lib/content/site"
import SocialIcons from "@/components/ui/SocialIcons"
import Button from "@/components/ui/Button"
import MobileNav from "./MobileNav"

interface HeaderProps {
  bannerNote: string
}

export default function Header({ bannerNote }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {bannerNote && (
        <div className="bg-oatmeal/60 text-espresso/90 text-center text-xs sm:text-sm py-2 px-4 font-body tracking-wide">
          ♡ {bannerNote}
        </div>
      )}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-linen/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="group flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Image
              src="/images/nurtured-oven-flowers-logo-transparent.png"
              alt=""
              width={56}
              height={72}
              className="h-11 w-auto sm:h-14 shrink-0"
              priority
            />
            <span className="flex flex-col items-start">
              <span className="font-heading text-xl sm:text-2xl text-espresso tracking-wide leading-tight">
                {siteConfig.brandName}
              </span>
              <span className="font-accent text-xs text-muted -mt-0.5 hidden sm:block">
                comfort sweets, made weekly
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted hover:text-espresso transition-colors text-sm tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <SocialIcons iconSize={17} />
            <Button href="/menu" size="sm">
              {siteConfig.orderCta}
            </Button>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="md:hidden p-2 text-espresso"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-dialog"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        returnFocusRef={menuButtonRef}
      />
    </>
  )
}
