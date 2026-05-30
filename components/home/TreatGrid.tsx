import Image from "next/image"
import Link from "next/link"
import Divider from "@/components/ui/Divider"
import { shouldShowTreatCategory } from "@/lib/content/launch"

const categories: {
  name: string
  description: string
  image: string
  href: string
  imageClassName?: string
}[] = [
  {
    name: "This Week\u2019s Menu",
    description: "3\u20135 fresh items, available to order now",
    image: "/images/biscoff_cookie.png",
    href: "/menu",
  },
  {
    name: "Weekly Comfort Box",
    description: "A curated mix of this week\u2019s best",
    image: "/images/tulip_gift_box.png",
    href: "/menu",
    imageClassName: "scale-[1.15]",
  },
  {
    name: "Comfort Boxes",
    description: "Mini, Classic, or Gathering for any occasion",
    image: "/images/weekly_comfort_box.png",
    href: "/gifts",
  },
  {
    name: "Little Extras",
    description: "Friday surprises, first paid, first claimed",
    image: "/images/oatmeal-cookie.png",
    href: "/little-extras",
  },
]

export default function TreatGrid() {
  return (
    <section className="bg-oatmeal/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-14">
          <p className="font-accent text-eyebrow text-lg mb-2">what we offer</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            Fresh every week
          </h2>
          <Divider icon="dot" className="mt-4 mb-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7">
          {categories.filter((cat) => shouldShowTreatCategory(cat.href)).map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-gentle hover:shadow-warm transition-shadow duration-300"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className={`object-cover transition-transform duration-700 group-hover:scale-105 ${cat.imageClassName ?? ""}`}
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-espresso/15 to-transparent" />
              <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/10 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <h3 className="font-heading text-lg sm:text-xl text-cream tracking-wide">
                  {cat.name}
                </h3>
                <p className="text-cream/90 text-sm font-body mt-1">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
