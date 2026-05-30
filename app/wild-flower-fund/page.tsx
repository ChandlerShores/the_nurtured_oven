import type { Metadata } from "next"
import Image from "next/image"
import "./wild-flower-fund.css"
import Divider from "@/components/ui/Divider"
import Button from "@/components/ui/Button"
import WildflowerSprig from "@/components/wildflower/WildflowerSprig"
import { wildFlowerFund } from "@/lib/content/wildFlowerFund"
import { siteConfig } from "@/lib/content/site"

export const metadata: Metadata = {
  title: `${wildFlowerFund.name} | The Nurtured Oven`,
  description:
    "10% of every purchase from The Nurtured Oven is set aside to help local families navigating difficult seasons through food, encouragement, and practical care.",
}

export default function WildFlowerFundPage() {
  return (
    <div className="bg-cream">
      <section className="border-b border-linen/35">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
            <div>
              <p className="font-accent text-eyebrow text-lg mb-2">
                {wildFlowerFund.pageHeroEyebrow}
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide leading-tight max-w-2xl">
                {wildFlowerFund.name}
              </h1>
              <Divider icon="wildflower" className="my-5 justify-start [&::after]:hidden" />
              <p className="font-body text-lg sm:text-xl text-espresso leading-relaxed max-w-2xl">
                {wildFlowerFund.heroSummary}
              </p>
              <p className="mt-5 text-muted font-body text-base sm:text-lg leading-relaxed max-w-xl">
                A bakery purchase becomes more than a box. It helps provide
                care for someone close to home.
              </p>
            </div>

            <div className="relative aspect-[4/3] max-h-[360px] rounded-2xl overflow-hidden border border-linen/40 shadow-warm">
              <Image
                src={wildFlowerFund.bannerImage}
                alt={wildFlowerFund.bannerImageAlt}
                fill
                priority
                className="object-cover object-bottom saturate-[0.85]"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wildFlowerFund.atAGlance.map((item) => (
            <article
              key={item.label}
              className="bg-warm-white rounded-xl border border-linen/55 shadow-gentle px-5 py-6"
            >
              <p className="font-body text-xs font-semibold text-olive uppercase tracking-wide mb-3">
                {item.label}
              </p>
              <p className="font-body text-espresso text-sm leading-relaxed">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-oatmeal/45 border-y border-linen/35">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12">
            <div>
              <p className="font-accent text-eyebrow text-lg mb-2">
                the heart behind it
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide leading-snug">
                A small way to show up.
              </h2>
            </div>
            <div className="space-y-5 text-muted font-body text-base sm:text-lg leading-relaxed">
              {wildFlowerFund.founderNote.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
        <div className="text-center mb-8">
          <p className="font-accent text-eyebrow text-lg mb-2">
            what support can look like
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
            Practical care, close to home.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wildFlowerFund.supportExamples.map((example) => (
            <div
              key={example}
              className="rounded-xl border border-linen/50 bg-warm-white px-5 py-5 font-body text-espresso leading-relaxed"
            >
              {example}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-olive text-cream">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12">
            <div>
              <p className="font-accent text-cream/80 text-lg mb-2">
                good to know
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl tracking-wide">
                Clear care, handled privately.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wildFlowerFund.goodToKnow.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-cream/20 bg-cream/10 px-5 py-5 font-body text-sm leading-relaxed text-cream/92"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-oatmeal/45 border-t border-linen/30">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-14 text-center">
          <WildflowerSprig size="sm" className="mx-auto mb-4" />
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide mb-3">
            {wildFlowerFund.cta.heading}
          </h2>
          <p className="text-muted font-body text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto">
            {wildFlowerFund.cta.body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/contact?intent=weekly-order" size="lg">
              {siteConfig.orderCta}
            </Button>
            <Button href="/menu" variant="outline" size="lg">
              View menu
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
