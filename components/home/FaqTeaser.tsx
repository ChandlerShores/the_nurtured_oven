"use client"

import { useState } from "react"
import Link from "next/link"
import { homepageFaq } from "@/lib/content/faq"
import Divider from "@/components/ui/Divider"

export default function FaqTeaser() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-warm-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-12">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">good to know</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            Common questions
          </h2>
          <Divider icon="dot" className="mt-4 mb-0" />
        </div>

        <div className="space-y-3">
          {homepageFaq.map((entry, i) => (
            <div key={i} className="border border-linen/60 rounded-xl overflow-hidden bg-cream/50 shadow-gentle">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-oatmeal/20 transition-colors"
                aria-expanded={openIndex === i}
              >
                <span className="font-heading text-base sm:text-lg text-espresso pr-4 tracking-wide">
                  {entry.question}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={`text-brown-sugar/50 shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-60" : "max-h-0"
                }`}
              >
                <p className="px-5 pb-5 text-brown-sugar/70 leading-relaxed font-body text-sm">
                  {entry.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/faq"
            className="text-brown-sugar/70 hover:text-espresso text-sm tracking-wide underline underline-offset-4 decoration-linen hover:decoration-brown-sugar transition-colors"
          >
            View all frequently asked questions →
          </Link>
        </div>
      </div>
    </section>
  )
}
