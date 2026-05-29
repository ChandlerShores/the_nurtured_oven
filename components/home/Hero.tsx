import Image from "next/image"
import Button from "@/components/ui/Button"
import { currentMenu } from "@/lib/content/currentMenu"

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[80vh] flex items-center">
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

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full py-20">
        <div className="max-w-xl">
          <p className="font-accent text-cream/95 text-lg sm:text-xl mb-3">this week&apos;s menu is open</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-cream leading-snug tracking-wide">
            This Week&apos;s Menu
          </h1>

          <div className="flex items-center gap-3 my-6">
            <span className="h-px bg-cream/30 w-12" />
            <svg width="12" height="11" viewBox="0 0 14 13" fill="currentColor" className="text-blush/70">
              <path d="M7 12.5s-5.5-3.5-5.5-7A3 3 0 0 1 7 3a3 3 0 0 1 5.5 2.5c0 3.5-5.5 7-5.5 7z" />
            </svg>
            <span className="h-px bg-cream/30 w-12" />
          </div>

          <p className="text-cream/95 text-base sm:text-lg leading-relaxed font-body">
            Preorder by Wednesday at noon for Friday pickup or delivery. This week: soft cinnamon rolls, our signature oatmeal cookie, and marshmallow cloud bars.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="/menu" size="lg">
              View This Week&apos;s Menu
            </Button>
            <Button href="/menu#order-cta" variant="inverse" size="lg">
              Order Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
