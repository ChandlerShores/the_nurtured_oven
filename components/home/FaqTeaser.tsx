"use client"

import Link from "next/link"
import { homepageFaq } from "@/lib/content/faq"
import Divider from "@/components/ui/Divider"
import Accordion from "@/components/ui/Accordion"

export default function FaqTeaser() {
  return (
    <section className="bg-warm-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-12">
          <p className="font-accent text-eyebrow text-lg mb-2">good to know</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            Common questions
          </h2>
          <Divider icon="dot" className="mt-4 mb-0" />
        </div>

        <Accordion
          items={homepageFaq}
          itemClassName="border border-linen/60 rounded-xl overflow-hidden bg-cream/50 shadow-gentle"
        />

        <div className="text-center mt-8">
          <Link
            href="/faq"
            className="text-muted hover:text-espresso text-sm tracking-wide underline underline-offset-4 decoration-linen hover:decoration-brown-sugar transition-colors"
          >
            View all frequently asked questions →
          </Link>
        </div>
      </div>
    </section>
  )
}
