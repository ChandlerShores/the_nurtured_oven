import Image from "next/image"
import Divider from "@/components/ui/Divider"
import Button from "@/components/ui/Button"
import WildflowerSprig from "@/components/wildflower/WildflowerSprig"
import { wildFlowerFund } from "@/lib/content/wildFlowerFund"

export default function WildFlowerFundSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-cream">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <Image
          src="/images/nurtured-oven-flowers-logo-transparent.png"
          alt=""
          fill
          className="object-contain"
          sizes="100vw"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 text-center">
        <WildflowerSprig size="md" className="mx-auto mb-4" />

        <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
          {wildFlowerFund.name}
        </h2>

        <Divider icon="wildflower" className="my-5" />

        <p className="font-accent text-eyebrow text-lg">
          {wildFlowerFund.tagline}
        </p>

        <p className="text-muted text-base sm:text-lg leading-relaxed font-body max-w-xl mx-auto mt-5">
          {wildFlowerFund.intro}
        </p>

        <div className="mt-8">
          <Button href={wildFlowerFund.path} variant="outline" size="md">
            Learn about the fund
          </Button>
        </div>

        <Divider icon="wildflower" className="mt-8" />
      </div>
    </section>
  )
}
