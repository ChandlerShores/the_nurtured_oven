import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import "./wild-flower-fund.css"
import Divider from "@/components/ui/Divider"
import Button from "@/components/ui/Button"
import WildflowerSprig from "@/components/wildflower/WildflowerSprig"
import { wildFlowerFund } from "@/lib/content/wildFlowerFund"

export const metadata: Metadata = {
  title: `${wildFlowerFund.name} | The Nurtured Oven`,
  description:
    "10% of every purchase from The Nurtured Oven is set aside to help local families navigating difficult seasons through food, encouragement, and practical care.",
}

export default function WildFlowerFundPage() {
  return (
    <div className="bg-cream">
      <section className="wff-hero relative overflow-hidden bg-cream">
        <div className="relative h-44 sm:h-52 md:h-60 w-full">
          <Image
            src={wildFlowerFund.bannerImage}
            alt={wildFlowerFund.bannerImageAlt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/40 to-cream"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center px-5 sm:px-8 pt-10 sm:pt-12 pb-14 sm:pb-16 text-center">
          <WildflowerSprig size="md" className="mx-auto mb-4" />
          <p className="font-accent text-eyebrow text-lg sm:text-xl mb-2">
            {wildFlowerFund.pageHeroEyebrow}
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-espresso tracking-wide leading-snug max-w-2xl">
            {wildFlowerFund.name}
          </h1>
          <Divider icon="wildflower" className="mt-5 mb-3" />
          <p className="font-accent text-eyebrow text-xl sm:text-2xl">
            {wildFlowerFund.tagline}
          </p>
          <p className="mt-6 font-heading text-lg sm:text-xl text-muted italic max-w-xl leading-relaxed">
            {wildFlowerFund.openingLine}
          </p>
        </div>
      </section>

      <section className="relative -mt-1 z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {wildFlowerFund.atAGlance.map((item) => (
            <article
              key={item.label}
              className="wff-glance-card bg-warm-white/90 backdrop-blur-sm rounded-2xl border border-linen/50 shadow-gentle px-6 py-7 sm:px-8 sm:py-8"
            >
              <p className="font-accent text-eyebrow text-sm mb-2 tracking-wide">
                {item.label}
              </p>
              <p className="font-body text-muted text-base sm:text-[1.05rem] leading-relaxed">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="wff-letter bg-warm-white rounded-[1.75rem] border border-linen/40 shadow-warm pl-6 pr-6 py-10 sm:pl-14 sm:pr-12 sm:py-14">
          <div className="space-y-7 text-muted font-body text-base sm:text-lg leading-[1.75]">
            {wildFlowerFund.bodyParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        <blockquote className="mt-12 sm:mt-16 text-center px-4">
          <WildflowerSprig size="sm" className="mx-auto mb-5 opacity-80" />
          <p className="font-heading text-xl sm:text-2xl text-espresso/90 italic leading-relaxed tracking-wide max-w-2xl mx-auto">
            &ldquo;{wildFlowerFund.pullQuote}&rdquo;
          </p>
        </blockquote>

        <p className="text-caption text-sm font-body text-center max-w-md mx-auto leading-relaxed mt-12 sm:mt-14">
          {wildFlowerFund.gentleNote}
        </p>
      </section>

      <section className="bg-oatmeal/40 border-t border-linen/30">

        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
          <p className="font-accent text-eyebrow text-lg mb-2">
            a way to share comfort further
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide mb-3">
            {wildFlowerFund.cta.heading}
          </h2>
          <Divider icon="wildflower" className="my-5" />
          <p className="text-muted font-body text-base sm:text-lg leading-relaxed mb-9 max-w-md mx-auto">
            {wildFlowerFund.cta.body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/menu" size="lg">
              View This Week&apos;s Menu
            </Button>
            <Button href="/faq" variant="outline" size="lg">
              Read the FAQ
            </Button>
          </div>
          <p className="mt-10 text-sm font-body">
            <Link
              href="/"
              className="text-muted hover:text-espresso underline underline-offset-4 decoration-linen hover:decoration-sage/60 transition-colors"
            >
              Back to home
            </Link>
          </p>
        </div>
      </section>

    </div>
  )
}
