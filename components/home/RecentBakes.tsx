import { recentBakes, socialLinks } from "@/lib/content/social"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"
import RecentBakesGallery from "./RecentBakesGallery"

export default function RecentBakes() {
  return (
    <section className="bg-oatmeal/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-12">
          <p className="font-accent text-eyebrow text-lg mb-2">follow along</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            Recent bakes
          </h2>
          <Divider icon="heart" className="mt-4 mb-2" />
          <p className="text-muted text-base font-body max-w-md mx-auto leading-relaxed">
            Follow along for weekly menu drops, seasonal boxes,
            and behind-the-scenes baking.
          </p>
        </div>

        <RecentBakesGallery posts={recentBakes} />

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
