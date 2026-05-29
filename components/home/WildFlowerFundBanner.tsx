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
        className="object-cover object-center saturate-[0.72] opacity-58"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-cream/45" aria-hidden="true" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-14 text-center">
        <div className="rounded-2xl bg-cream border border-linen/40 shadow-gentle px-6 py-8 sm:px-10 sm:py-10">
          <WildflowerSprig size="sm" className="mx-auto mb-4 opacity-80" />
          <p className="font-accent text-eyebrow text-lg mb-2">
            {wildFlowerFund.name}
          </p>
          <p className="font-body text-espresso text-base sm:text-lg leading-relaxed">
            {wildFlowerFund.percentLabel} of every purchase supports moms and
            families navigating the hardest seasons through food, encouragement,
            and practical care.
          </p>
          <p className="font-heading text-lg sm:text-xl text-espresso/85 italic mt-5 leading-relaxed">
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
