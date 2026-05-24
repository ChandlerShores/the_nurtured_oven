import type { Metadata } from "next"
import Image from "next/image"
import { founder } from "@/lib/content/founder"
import { siteConfig } from "@/lib/content/site"
import SocialIcons from "@/components/ui/SocialIcons"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

export const metadata: Metadata = {
  title: "About | The Nurtured Oven",
  description:
    "The story behind The Nurtured Oven — a Kentucky cottage bakery born from comfort, care, and the early days of motherhood.",
}

export default function AboutPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="font-accent text-brown-sugar/60 text-lg mb-2">our story</p>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso leading-snug tracking-wide">
              {founder.headline}
            </h1>
            <Divider icon="heart" className="my-5 justify-start [&::after]:hidden" />
            <p className="text-brown-sugar/70 text-lg leading-relaxed font-body">
              {founder.shortBio}
            </p>
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-warm">
            <Image
              src={founder.photo}
              alt={founder.photoAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>

      <div className="bg-warm-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso mb-8 tracking-wide">
            The story
          </h2>
          <div className="space-y-5">
            {founder.fullStory.map((paragraph, i) => (
              <p
                key={i}
                className="text-brown-sugar/70 text-lg leading-relaxed font-body"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <blockquote className="text-center">
          <Divider icon="heart" className="mb-6" />
          <p className="font-heading text-2xl sm:text-3xl text-espresso leading-relaxed tracking-wide">
            &ldquo;{founder.mission}&rdquo;
          </p>
          <Divider icon="heart" className="mt-6" />
        </blockquote>

        <div className="mt-12">
          <h2 className="font-heading text-xl text-espresso mb-6 text-center tracking-wide">
            What we believe
          </h2>
          <ul className="space-y-3 max-w-md mx-auto">
            {founder.beliefs.map((belief, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-brown-sugar/70 font-body"
              >
                <span className="text-blush/70 mt-0.5 shrink-0 text-sm">♡</span>
                <span>{belief}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-oatmeal/40">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">come say hello</p>
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso mb-4 tracking-wide">
            Let&apos;s connect
          </h2>
          <Divider icon="heart" />
          <p className="text-brown-sugar/70 font-body text-lg mb-6">
            Follow along for weekly menu drops, seasonal updates, and the
            occasional kitchen-counter photo.
          </p>
          <div className="flex justify-center mb-8">
            <SocialIcons iconSize={22} />
          </div>
          <Button href="/menu">View This Week&apos;s Menu</Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <p className="text-brown-sugar/40 text-xs leading-relaxed text-center">
          {siteConfig.cottageBakeryDisclosure}
        </p>
      </div>
    </div>
  )
}
