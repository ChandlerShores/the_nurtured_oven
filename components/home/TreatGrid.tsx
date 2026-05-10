import Image from "next/image"
import Link from "next/link"
import Divider from "@/components/ui/Divider"

const categories = [
  { name: "Cookies", image: "/images/biscoff_cookie.png", href: "/menu#cookies" },
  { name: "Bars", image: "/images/cloudbar_stretch.png", href: "/menu#bars" },
  { name: "Brownies", image: "/images/biscoff-butter-cloud-bar.png", href: "/menu#brownies" },
  { name: "Seasonal Treats", image: "/images/seasonal-feature.png", href: "/menu#seasonal" },
  { name: "Gift Boxes", image: "/images/cloud-bar-in-package.png", href: "/gifts" },
  { name: "Comfort Boxes", image: "/images/oatmeal-cookie.png", href: "/gifts" },
]

export default function TreatGrid() {
  return (
    <section className="bg-oatmeal/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-14">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">made from scratch</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            What we bake
          </h2>
          <Divider icon="dot" className="mt-4 mb-0" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-gentle hover:shadow-warm transition-shadow duration-300"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 via-espresso/10 to-transparent" />
              <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/10 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h3 className="font-heading text-base sm:text-lg text-warm-white tracking-wide">
                  {cat.name}
                </h3>
                <span className="text-cream/70 text-xs font-body opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-0.5 block">
                  view treats →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
