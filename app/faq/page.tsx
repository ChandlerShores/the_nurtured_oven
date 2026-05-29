"use client"

import { faqEntries } from "@/lib/content/faq"
import { getPublicFaqEntries } from "@/lib/content/launch"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"
import Accordion from "@/components/ui/Accordion"

export default function FaqPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <p className="font-accent text-eyebrow text-lg mb-2">good to know</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
            Frequently asked questions
          </h1>
          <Divider icon="heart" className="mt-4 mb-2" />
          <p className="text-muted text-lg font-body">
            Everything you need to know about weekly ordering, pickup and delivery, payment, and more.
          </p>
        </div>

        <Accordion items={getPublicFaqEntries(faqEntries)} />

        <div className="mt-16 text-center bg-warm-white rounded-2xl p-8 sm:p-12 border border-linen/30 shadow-gentle">
          <h2 className="font-heading text-2xl text-espresso mb-3 tracking-wide">
            Still have questions?
          </h2>
          <Divider icon="heart" />
          <p className="text-muted font-body mb-6">
            Reach out and we&apos;ll be happy to help.
          </p>
          <Button href="/contact?intent=general">Get in Touch</Button>
        </div>
      </div>
    </div>
  )
}
