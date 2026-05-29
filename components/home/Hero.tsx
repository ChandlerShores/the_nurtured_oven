import Image from "next/image"
import Button from "@/components/ui/Button"
import { currentMenu } from "@/lib/content/currentMenu"
import { siteConfig } from "@/lib/content/site"

export default function Hero() {
  return (
    <section className="relative min-h-[68vh] sm:min-h-[62vh] flex items-center">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={currentMenu.featured.image}
          alt={`This week's feature: ${currentMenu.featured.name} from The Nurtured Oven`}
          fill
          priority
          className="object-cover object-[58%_30%]"
          sizes="100vw"
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-espresso from-0% via-espresso/80 via-[48%] to-transparent to-[85%]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 inset-x-0 h-14 sm:h-16 bg-gradient-to-b from-transparent via-espresso/15 to-cream pointer-events-none z-[5]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="font-accent text-cream/95 text-lg sm:text-xl mb-3">
            this week&apos;s menu is open
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-cream leading-snug tracking-wide">
            This Week&apos;s Menu
          </h1>

          <p className="text-cream/95 text-base sm:text-lg leading-relaxed font-body mt-5">
            Preorder by Wednesday at noon for Friday pickup or delivery. This week:
            soft cinnamon rolls, our signature oatmeal cookie, and marshmallow cloud
            bars.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button href="/contact?intent=weekly-order" size="lg">
              {siteConfig.orderCta}
            </Button>
            <Button
              href="/menu"
              variant="inverse"
              size="lg"
            >
              View menu
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
