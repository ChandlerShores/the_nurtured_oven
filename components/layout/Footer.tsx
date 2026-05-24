import Link from "next/link"
import { siteConfig } from "@/lib/content/site"
import SocialIcons from "@/components/ui/SocialIcons"
import Divider from "@/components/ui/Divider"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-espresso/90 text-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="font-heading text-2xl text-cream tracking-wide">
              {siteConfig.brandName}
            </Link>
            <p className="font-accent text-cream/50 text-sm mt-1">comfort sweets, made weekly</p>
            <p className="mt-4 text-cream/60 text-sm leading-relaxed max-w-xs">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-cream/40 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/70 hover:text-cream text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Service Area */}
          <div>
            <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-cream/40 mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-2.5 text-sm text-cream/70">
              <li>
                <Link href="/menu" className="hover:text-cream transition-colors">
                  {siteConfig.orderCta}
                </Link>
              </li>
              <li>{siteConfig.serviceArea.label}</li>
              <li>{siteConfig.serviceArea.deliveryNote}</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-cream/40 mb-4">
              Follow Along
            </h3>
            <SocialIcons className="[&_a]:text-cream/60 [&_a:hover]:text-cream" iconSize={20} />
            <p className="mt-3 text-cream/40 text-sm">
              {siteConfig.social.instagram.handle}
            </p>
          </div>
        </div>

        {/* Bottom */}
        <Divider icon="heart" className="[&>svg]:text-cream/20 [&::before]:bg-cream/10 [&::after]:bg-cream/10 my-10" />
        <div>
          <p className="text-cream/30 text-xs leading-relaxed max-w-2xl">
            {siteConfig.cottageBakeryDisclosure}
          </p>
          <p className="text-cream/25 text-xs mt-4">
            &copy; {year} {siteConfig.brandName}. Made with ♡ in Kentucky.
          </p>
          <p className="text-cream/20 text-[10px] mt-2 tracking-wide">
            Built by Chandler Shores Advisory
          </p>
        </div>
      </div>
    </footer>
  )
}
