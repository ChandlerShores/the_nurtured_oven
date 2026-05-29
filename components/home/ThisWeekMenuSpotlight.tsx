import Image from "next/image"
import Link from "next/link"
import Divider from "@/components/ui/Divider"
import Button from "@/components/ui/Button"
import { currentMenu } from "@/lib/content/currentMenu"

export default function ThisWeekMenuSpotlight() {
  const { featured, items } = currentMenu

  return (
    <section className="bg-oatmeal/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-12">
          <p className="font-accent text-eyebrow text-lg mb-2">this week&apos;s menu</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            Curated for this week
          </h2>
          <Divider icon="flourish" className="mt-4 mb-0" />
        </div>

        <Link
          href="/menu#this-weeks-feature"
          className="group block bg-warm-white rounded-[1.75rem] border border-linen/40 shadow-warm overflow-hidden mb-7 sm:mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[360px] overflow-hidden">
              <Image
                src={featured.image}
                alt={featured.name}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <span className="inline-block bg-blush/20 text-blush text-xs font-medium px-3 py-1 rounded-full w-fit mb-4 tracking-wide uppercase">
                {featured.featuredEyebrow ?? "This Week's Feature"}
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide mb-3">
                {featured.name}
              </h3>
              <p className="text-muted text-base sm:text-lg leading-relaxed font-body mb-5">
                {featured.description}
              </p>
              <span className="font-body text-sm font-semibold text-olive group-hover:text-espresso transition-colors tracking-wide">
                See this week&apos;s feature →
              </span>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {items.map((item) => (
            <Link
              key={item.slug}
              href="/menu"
              className="group block bg-warm-white rounded-2xl border border-linen/40 shadow-gentle overflow-hidden"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                )}
              </div>
              <div className="p-6 sm:p-7">
                {item.roleLabel && (
                  <span className="inline-block bg-oatmeal/70 text-espresso/80 text-xs font-medium px-3 py-1 rounded-full w-fit mb-3 tracking-wide uppercase">
                    {item.roleLabel}
                  </span>
                )}
                <h3 className="font-heading text-xl text-espresso tracking-wide mb-2">
                  {item.name}
                </h3>
                <p className="text-muted-sm text-sm leading-relaxed font-body">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button href="/menu" size="lg">
            View This Week&apos;s Menu
          </Button>
        </div>
      </div>
    </section>
  )
}
