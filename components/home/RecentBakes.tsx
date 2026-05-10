import Image from "next/image"
import { recentBakes, socialLinks } from "@/lib/content/social"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

export default function RecentBakes() {
  return (
    <section className="bg-oatmeal/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-12">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">follow along</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            Recent bakes
          </h2>
          <Divider icon="heart" className="mt-4 mb-2" />
          <p className="text-brown-sugar/70 text-base font-body max-w-md mx-auto leading-relaxed">
            Not ready to order? Follow along for recent bakes, seasonal boxes,
            and ordering updates.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {recentBakes.map((post, i) => (
            <div key={i} className="group">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-gentle mb-3">
                <Image
                  src={post.image}
                  alt={post.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
              <p className="text-brown-sugar/70 text-sm leading-relaxed font-body px-1">
                {post.caption}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href={socialLinks.instagram.url} variant="outline">
            Follow on Instagram
          </Button>
          <Button href={socialLinks.facebook.url} variant="ghost">
            Find us on Facebook
          </Button>
        </div>
      </div>
    </section>
  )
}
