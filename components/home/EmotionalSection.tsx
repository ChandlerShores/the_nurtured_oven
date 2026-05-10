import Image from "next/image"
import Divider from "@/components/ui/Divider"

export default function EmotionalSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-warm-white">
      <div className="absolute inset-0 opacity-[0.07]">
        <Image
          src="/images/oatmeal_cookie_tulips.png"
          alt="Oatmeal cookie with pink tulips"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <Divider icon="heart" className="mb-6" />
        <p className="font-heading text-2xl sm:text-3xl lg:text-[2.5rem] text-espresso leading-relaxed tracking-wide">
          For the people who care for everyone else
        </p>
        <p className="font-accent text-brown-sugar/70 text-xl sm:text-2xl mt-3">
          a little comfort goes a long way.
        </p>
        <Divider icon="heart" className="mt-6" />
      </div>
    </section>
  )
}
