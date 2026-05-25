import Image from "next/image"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"
import { founder } from "@/lib/content/founder"

export default function FounderPreview() {
  return (
    <section className="bg-warm-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="font-accent text-eyebrow text-lg mb-2">our story</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-espresso leading-snug tracking-wide">
              {founder.headline}
            </h2>
            <Divider icon="heart" className="my-5 justify-start [&::after]:hidden" />
            <p className="text-muted text-lg leading-relaxed font-body">
              {founder.shortBio}
            </p>
            <blockquote className="mt-6 pl-5 border-l-2 border-blush/60 text-espresso/85 italic font-heading text-lg leading-relaxed">
              &ldquo;{founder.mission}&rdquo;
            </blockquote>
            <div className="mt-8">
              <Button href="/about" variant="outline">
                Read the full story
              </Button>
            </div>
          </div>

          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-warm">
            <Image
              src={founder.photo}
              alt={founder.photoAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
