import Image from "next/image"
import Link from "next/link"
import WildflowerSprig from "@/components/wildflower/WildflowerSprig"
import { wildFlowerFund } from "@/lib/content/wildFlowerFund"

export default function WildFlowerFundBanner() {
  return (
    <section
      className="relative overflow-hidden border-b border-linen/30"
      aria-label={wildFlowerFund.name}
    >
      <Image
        src={wildFlowerFund.bannerImage}
        alt={wildFlowerFund.bannerImageAlt}
        fill
        className="object-cover object-center saturate-[0.65] opacity-[0.45]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-cream/55" aria-hidden="true" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 py-10 sm:py-12 text-center">
        <div className="rounded-2xl bg-cream border border-linen/50 shadow-gentle px-6 py-7 sm:px-10 sm:py-8">
          <WildflowerSprig size="sm" className="mx-auto mb-4 opacity-80" />
          <p className="font-accent text-eyebrow text-lg mb-2">
            {wildFlowerFund.name}
          </p>
          <p className="font-body text-espresso text-base sm:text-lg font-medium leading-relaxed">
            {wildFlowerFund.percentLabel} of every purchase supports moms and
            families navigating the hardest seasons through food, encouragement,
            and practical care.
          </p>
          <p className="font-heading text-lg sm:text-xl text-espresso/85 italic mt-4 leading-relaxed">
            {wildFlowerFund.homepageSubline}
          </p>
          <p className="mt-6">
            <Link
              href={wildFlowerFund.path}
              className="font-body text-sm font-medium text-espresso underline underline-offset-[3px] decoration-brown-sugar/50 hover:decoration-espresso transition-colors"
            >
              Learn about the fund
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
