import Image from "next/image"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"
import { founder } from "@/lib/content/founder"

export default function FounderPreview() {
  return (
    <section className="bg-cream border-b border-linen/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="font-accent text-eyebrow text-lg mb-2">our story</p>
            <h2 className="font-heading text-2xl sm:text-3xl text-espresso leading-snug tracking-wide">
              {founder.headline}
            </h2>
            <Divider icon="flourish" className="my-4 justify-start [&::after]:hidden" />
            <p className="text-muted text-base sm:text-lg leading-relaxed font-body">
              {founder.shortBio}
            </p>
            <blockquote className="mt-5 pl-4 border-l-2 border-blush/50 text-espresso/85 italic font-heading text-base sm:text-lg leading-relaxed">
              &ldquo;{founder.mission}&rdquo;
            </blockquote>
            <div className="mt-6">
              <Button href="/about" variant="outline" size="md">
                Read the full story
              </Button>
            </div>
          </div>

          <div className="relative aspect-[5/4] sm:aspect-[4/3] lg:aspect-[5/4] max-h-[250px] sm:max-h-[300px] lg:max-h-[340px] w-full mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-linen/40 shadow-gentle">
            <Image
              src={founder.photo}
              alt={founder.photoAlt}
              fill
              className="object-cover object-top scale-[1.2] saturate-[0.9] brightness-[0.98]"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
