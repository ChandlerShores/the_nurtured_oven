"use client"

import { useState } from "react"
import { faqEntries } from "@/lib/content/faq"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="bg-cream">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">good to know</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
            Frequently asked questions
          </h1>
          <Divider icon="heart" className="mt-4 mb-2" />
          <p className="text-brown-sugar/70 text-lg font-body">
            Everything you need to know about weekly ordering, Comfort Boxes, payment, and more.
          </p>
        </div>

        <div className="space-y-3">
          {faqEntries.map((entry, i) => (
            <div
              key={i}
              className="border border-linen/40 rounded-xl overflow-hidden bg-warm-white shadow-gentle"
            >
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

        <div className="mt-16 text-center bg-warm-white rounded-2xl p-8 sm:p-12 border border-linen/30 shadow-gentle">
          <h2 className="font-heading text-2xl text-espresso mb-3 tracking-wide">
            Still have questions?
          </h2>
          <Divider icon="heart" />
          <p className="text-brown-sugar/70 font-body mb-6">
            Reach out and we&apos;ll be happy to help.
          </p>
          <Button href="/contact?intent=general">Get in Touch</Button>
        </div>
      </div>
    </div>
  )
}
