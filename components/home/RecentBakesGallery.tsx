"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import type { SocialPost } from "@/lib/content/social"

interface RecentBakesGalleryProps {
  posts: SocialPost[]
}

export default function RecentBakesGallery({ posts }: RecentBakesGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const isOpen = activeIndex !== null
  const current = isOpen ? posts[activeIndex] : null

  const close = useCallback(() => setActiveIndex(null), [])

  const goTo = useCallback(
    (index: number) => {
      const len = posts.length
      setActiveIndex(((index % len) + len) % len)
    },
    [posts.length]
  )

  const goPrev = useCallback(() => {
    if (activeIndex === null) return
    goTo(activeIndex - 1)
  }, [activeIndex, goTo])

  const goNext = useCallback(() => {
    if (activeIndex === null) return
    goTo(activeIndex + 1)
  }, [activeIndex, goTo])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen, close, goPrev, goNext])

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
        {posts.map((post, i) => (
          <div key={post.image} className="group">
            <button
              type="button"
              onClick={() => setActiveIndex(i)}
              className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-gentle mb-3 block cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown-sugar/60"
              aria-label={`View photo: ${post.alt}`}
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <span className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/10 transition-colors duration-300" />
            </button>
            <p className="text-brown-sugar/70 text-sm leading-relaxed font-body px-1">
              {post.caption}
            </p>
          </div>
        ))}
      </div>

      {isOpen && current && activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Recent bakes gallery"
        >
          <button
            type="button"
            className="absolute inset-0 bg-espresso/75 backdrop-blur-sm"
            onClick={close}
            aria-label="Close gallery"
          />

          <div className="relative z-10 w-full max-w-3xl bg-cream rounded-2xl shadow-warm border border-linen/50 overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3 border-b border-linen/40 bg-oatmeal/40">
              <p className="font-accent text-brown-sugar/70 text-sm sm:text-base">
                {activeIndex + 1} of {posts.length}
              </p>
              <button
                type="button"
                onClick={close}
                className="p-2 rounded-lg text-brown-sugar/70 hover:text-espresso hover:bg-linen/50 transition-colors"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="relative aspect-square sm:aspect-[4/3] bg-oatmeal/30">
              <Image
                src={current.image}
                alt={current.alt}
                fill
                className="object-contain sm:object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />

              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-cream/90 text-brown-sugar border border-linen/60 shadow-gentle hover:bg-warm-white hover:text-espresso transition-colors"
                aria-label="Previous photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-cream/90 text-brown-sugar border border-linen/60 shadow-gentle hover:bg-warm-white hover:text-espresso transition-colors"
                aria-label="Next photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-linen/40">
              <p className="text-brown-sugar/80 text-sm sm:text-base leading-relaxed font-body text-center">
                {current.caption}
              </p>

              <div className="mt-4 flex justify-center gap-2">
                {posts.map((post, i) => (
                  <button
                    key={post.image}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? "w-6 bg-brown-sugar"
                        : "w-2 bg-linen hover:bg-blush/80"
                    }`}
                    aria-label={`Go to photo ${i + 1}`}
                    aria-current={i === activeIndex ? "true" : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
