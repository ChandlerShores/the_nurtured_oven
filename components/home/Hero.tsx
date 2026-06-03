import Image from "next/image"
import type { FeaturedMenuProduct } from "@/lib/content/menu-types"

interface HeroProps {
  featured: FeaturedMenuProduct
}

export default function Hero({ featured }: HeroProps) {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[64vh] flex items-center">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={featured.image}
          alt={`This week's feature: ${featured.name} from The Nurtured Oven`}
          fill
          priority
          className="object-cover object-[58%_30%]"
          sizes="100vw"
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-espresso/95 from-0% via-espresso/72 via-[48%] to-transparent to-[82%]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 inset-x-0 h-14 sm:h-16 bg-gradient-to-b from-transparent via-espresso/15 to-cream pointer-events-none z-[5]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="font-accent text-cream/95 text-lg sm:text-xl mb-3">
            fresh from the oven
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-cream leading-snug tracking-wide">
            {featured.name} is open for preorder.
          </h1>

          <p className="text-cream/95 text-base sm:text-lg leading-relaxed font-body mt-5">
            Order by Wednesday at noon for Friday pickup or delivery.{" "}
            {featured.description}
          </p>
        </div>
      </div>
    </section>
  )
}
