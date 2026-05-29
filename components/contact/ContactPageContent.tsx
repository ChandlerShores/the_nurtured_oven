"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import ContactIntentSelector, {
  type ContactIntent,
} from "@/components/contact/ContactIntentSelector"
import ContactOrderForm from "@/components/contact/ContactOrderForm"
import Divider from "@/components/ui/Divider"
import SocialIcons from "@/components/ui/SocialIcons"
import { contactIntentOptions } from "@/components/contact/ContactIntentSelector"
import {
  getVisibleContactIntentIds,
  resolveContactDefaultIntent,
} from "@/lib/content/launch"

interface ContactPageContentProps {
  weeklyOrderingAvailable: boolean
  orderingClosedMessage: string
}

export default function ContactPageContent({
  weeklyOrderingAvailable,
  orderingClosedMessage,
}: ContactPageContentProps) {
  const searchParams = useSearchParams()
  const intentParam = searchParams.get("intent") as ContactIntent | null
  const visibleIntents = useMemo(() => {
    const ids = getVisibleContactIntentIds(weeklyOrderingAvailable)
    return contactIntentOptions.filter((o) => ids.includes(o.id))
  }, [weeklyOrderingAvailable])
  const [intent, setIntent] = useState<ContactIntent>(() =>
    resolveContactDefaultIntent(weeklyOrderingAvailable, intentParam)
  )

  useEffect(() => {
    setIntent(resolveContactDefaultIntent(weeklyOrderingAvailable, intentParam))
  }, [intentParam, weeklyOrderingAvailable])

  return (
    <div className="bg-cream">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10 sm:mb-12">
          <p className="font-accent text-eyebrow text-lg mb-2">
            let&apos;s get you taken care of
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
            Order &amp; Contact
          </h1>
          <Divider icon="heart" className="mt-4 mb-2" />
        </div>

        <h2 className="font-heading text-xl sm:text-2xl text-espresso tracking-wide text-center mb-6 sm:mb-8">
          What would you like to do?
        </h2>

        {!weeklyOrderingAvailable && (
          <p className="text-center text-muted text-sm font-body max-w-xl mx-auto mb-8 leading-relaxed">
            {orderingClosedMessage}
          </p>
        )}

        <ContactIntentSelector
          options={visibleIntents}
          selected={intent}
          onSelect={setIntent}
        />

        <div className="bg-warm-white rounded-2xl p-6 sm:p-10 shadow-gentle border border-linen/30">
          <ContactOrderForm intent={intent} />
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-sm text-sm font-body">
            Prefer to connect another way? Find us on social media.
          </p>
          <div className="mt-3 flex justify-center">
            <SocialIcons iconSize={20} />
          </div>
        </div>
      </div>
    </div>
  )
}
