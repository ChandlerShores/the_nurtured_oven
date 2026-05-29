"use client"

import Link from "next/link"
import { faqEntries } from "@/lib/content/faq"
import { getHomepageFaqEntries } from "@/lib/content/launch"
import Divider from "@/components/ui/Divider"
import Accordion from "@/components/ui/Accordion"

export default function FaqTeaser() {
  return (
    <section className="bg-warm-white border-b border-linen/25">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
        <div className="text-center mb-8">
          <p className="font-accent text-eyebrow text-lg mb-2">good to know</p>
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
            Common questions
          </h2>
          <Divider icon="flourish" className="mt-4 mb-0" />
        </div>

        <Accordion
          items={getHomepageFaqEntries(faqEntries)}
          itemClassName="border border-linen/60 rounded-xl overflow-hidden bg-cream/50 shadow-gentle"
        />

        <div className="text-center mt-6">
          <Link
            href="/faq"
            className="font-body text-sm font-medium text-espresso underline underline-offset-4 decoration-brown-sugar/50 hover:decoration-espresso transition-colors"
          >
            View all frequently asked questions
          </Link>
        </div>
      </div>
    </section>
  )
}
