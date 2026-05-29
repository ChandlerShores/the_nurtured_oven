import Image from "next/image"
import Link from "next/link"
import WildflowerSprig from "@/components/wildflower/WildflowerSprig"
import { wildFlowerFund } from "@/lib/content/wildFlowerFund"

export default function WildFlowerFundBanner() {
  return (
    <section
      className="relative overflow-hidden"
      aria-label={wildFlowerFund.name}
    >
      <Image
        src={wildFlowerFund.bannerImage}
        alt={wildFlowerFund.bannerImageAlt}
        fill
        className="object-cover object-center saturate-[0.7] brightness-[1.05]"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-cream/65" aria-hidden="true" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16 text-center">
        <div className="rounded-2xl bg-cream/90 backdrop-blur-sm border border-linen/40 shadow-gentle px-6 py-8 sm:px-10 sm:py-10">
          <WildflowerSprig size="sm" className="mx-auto mb-3" />
          <p className="font-accent text-espresso text-sm sm:text-base tracking-wide mb-2">
            {wildFlowerFund.name}
          </p>
          <p className="font-body text-espresso text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            {wildFlowerFund.percentLabel} of every purchase supports moms and
            families navigating the hardest seasons through food, encouragement,
            and practical care.{" "}
            <Link
              href={wildFlowerFund.path}
              className="font-medium underline underline-offset-[3px] decoration-sage/50 hover:decoration-sage transition-colors"
            >
              Learn about the fund
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
