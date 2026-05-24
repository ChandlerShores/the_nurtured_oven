import Image from "next/image"
import Button from "@/components/ui/Button"

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[80vh] flex items-center">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/weekly_comfort_box.png"
          alt="The Nurtured Oven Weekly Comfort Box — cookies, brownies, and cloud bars in an open gift box"
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
          <p className="font-accent text-cream/80 text-lg sm:text-xl mb-3">new menu every saturday</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-warm-white leading-snug tracking-wide">
            Small-batch comfort sweets, made weekly and shared with care.
          </h1>

          <div className="flex items-center gap-3 my-6">
            <span className="h-px bg-cream/30 w-12" />
            <svg width="12" height="11" viewBox="0 0 14 13" fill="currentColor" className="text-blush/70">
              <path d="M7 12.5s-5.5-3.5-5.5-7A3 3 0 0 1 7 3a3 3 0 0 1 5.5 2.5c0 3.5-5.5 7-5.5 7z" />
            </svg>
            <span className="h-px bg-cream/30 w-12" />
          </div>

          <p className="text-cream/80 text-base sm:text-lg leading-relaxed font-body">
            Order by Wednesday at noon. Pick up or get local delivery on Friday. Cookies, bars, brownies, and our signature Weekly Comfort Box.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="/menu" size="lg">
              View This Week&apos;s Menu
            </Button>
            <Button href="/gifts" variant="outline" size="lg" className="border-cream/40 text-cream hover:bg-cream/10 hover:text-cream">
              Send a Comfort Box
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
