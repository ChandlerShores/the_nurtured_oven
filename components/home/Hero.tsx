import Image from "next/image"
import Button from "@/components/ui/Button"

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[80vh] flex items-center">
      <Image
        src="/images/rustic_bread_hero.png"
        alt="Rustic artisan bread on a warm cream surface with dried flowers"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/60 via-espresso/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full py-20">
        <div className="max-w-xl">
          <p className="font-accent text-cream/80 text-lg sm:text-xl mb-3">from our kitchen to yours</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-warm-white leading-snug tracking-wide">
            Fresh-baked comfort for mothers and the people who love them.
          </h1>

          <div className="flex items-center gap-3 my-6">
            <span className="h-px bg-cream/30 w-12" />
            <svg width="12" height="11" viewBox="0 0 14 13" fill="currentColor" className="text-blush/70">
              <path d="M7 12.5s-5.5-3.5-5.5-7A3 3 0 0 1 7 3a3 3 0 0 1 5.5 2.5c0 3.5-5.5 7-5.5 7z" />
            </svg>
            <span className="h-px bg-cream/30 w-12" />
          </div>

          <p className="text-cream/80 text-base sm:text-lg leading-relaxed font-body">
            Small-batch cookies, bars, and nostalgic sweets made in Kentucky with warmth, intention, and care.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="/contact" size="lg">
              Request an Order
            </Button>
            <Button href="/gifts" variant="outline" size="lg" className="border-cream/40 text-cream hover:bg-cream/10 hover:text-cream">
              View Gift Boxes
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
