"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import ContactIntentSelector, {
  type ContactIntent,
} from "@/components/contact/ContactIntentSelector"
import ContactOrderForm from "@/components/contact/ContactOrderForm"
import Divider from "@/components/ui/Divider"
import SocialIcons from "@/components/ui/SocialIcons"
import { COMING_SOON_COPY } from "@/lib/content/coming-soon"
import { siteConfig } from "@/lib/content/site"
import { contactIntentOptions } from "@/components/contact/ContactIntentSelector"
import {
  getVisibleContactIntentIds,
  resolveContactDefaultIntent,
} from "@/lib/content/launch"

import type { CatalogItem } from "@/lib/order/catalog-types"

interface ContactPageContentProps {
  weeklyOrderingAvailable: boolean
  orderingClosedMessage: string
  catalog: CatalogItem[]
  featuredSlug: string
  prefillSlug?: string
  comingSoon?: boolean
}

export default function ContactPageContent({
  weeklyOrderingAvailable,
  orderingClosedMessage,
  catalog,
  featuredSlug,
  prefillSlug,
  comingSoon = false,
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
            {comingSoon ? COMING_SOON_COPY.eyebrow : "let's get you taken care of"}
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
            {comingSoon ? "Menu Reminders & Contact" : "Order & Contact"}
          </h1>
          <Divider icon="heart" className="mt-4 mb-2" />
          {comingSoon && (
            <p className="mt-5 text-muted text-base sm:text-lg font-body max-w-2xl mx-auto leading-relaxed">
              {COMING_SOON_COPY.body}
            </p>
          )}
        </div>

        <h2 className="font-heading text-xl sm:text-2xl text-espresso tracking-wide text-center mb-6 sm:mb-8">
          {comingSoon ? "Stay close for the first menu drop" : "What would you like to do?"}
        </h2>

        {!weeklyOrderingAvailable && !comingSoon && (
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
          <ContactOrderForm
            intent={intent}
            catalog={catalog}
            featuredSlug={featuredSlug}
            prefillSlug={prefillSlug}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-sm text-sm font-body">
            {comingSoon
              ? "Questions or special requests before ordering opens? Send a note on Instagram."
              : "Prefer to connect another way? Find us on social media."}
          </p>
          {comingSoon && (
            <a
              href={siteConfig.social.instagram.url}
              className="mt-4 inline-flex items-center justify-center whitespace-nowrap font-body font-semibold rounded-full border-2 border-olive bg-cream text-espresso shadow-gentle hover:bg-olive hover:text-cream transition-all duration-300 tracking-wide px-7 py-3 text-base"
            >
              {COMING_SOON_COPY.secondaryCta}
            </a>
          )}
          <div className="mt-3 flex justify-center">
            <SocialIcons iconSize={20} />
          </div>
        </div>
      </div>
    </div>
  )
}
