import Image from "next/image"
import Button from "@/components/ui/Button"

export default function FinalCta() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40">
      <Image
        src="/images/marshmallow-cloud-bar.png"
        alt="Homemade marshmallow cloud bar"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-espresso/50" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 text-center">
        <p className="font-accent text-cream/60 text-xl mb-3">one last thing</p>
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-warm-white leading-snug tracking-wide">
          Ready to send a little comfort?
        </h2>

        <div className="flex items-center justify-center gap-3 my-6">
          <span className="h-px bg-cream/25 w-10" />
          <svg width="12" height="11" viewBox="0 0 14 13" fill="currentColor" className="text-blush/60">
            <path d="M7 12.5s-5.5-3.5-5.5-7A3 3 0 0 1 7 3a3 3 0 0 1 5.5 2.5c0 3.5-5.5 7-5.5 7z" />
          </svg>
          <span className="h-px bg-cream/25 w-10" />
        </div>

        <p className="text-cream/70 text-base sm:text-lg font-body leading-relaxed">
          Whether it&apos;s for you, a friend, or someone who needs a warm
          reminder they&apos;re loved — we&apos;d love to bake for you.
        </p>
        <div className="mt-8">
          <Button href="/contact" size="lg">
            Request an Order
          </Button>
        </div>
      </div>
    </section>
  )
}
