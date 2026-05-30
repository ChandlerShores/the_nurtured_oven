import Image from "next/image"
import Divider from "@/components/ui/Divider"
import type { CurrentMenu } from "@/lib/content/menu-types"

interface MenuHeroProps {
  menu: Pick<
    CurrentMenu,
    "weekLabel" | "cutoffText" | "fulfillmentText" | "announcementBarText"
  >
}

export default function MenuHero({ menu }: MenuHeroProps) {
  return (
    <>
      {menu.announcementBarText && (
        <div className="bg-olive/90 text-cream text-center text-sm font-body px-5 py-3 tracking-wide">
          {menu.announcementBarText}
        </div>
      )}

      <div className="menu-hero relative overflow-hidden">
        <Image
          src="/images/nurtured-oven-flowers-logo-transparent.png"
          alt=""
          aria-hidden="true"
          width={220}
          height={280}
          className="menu-hero__botanical menu-hero__botanical--left"
        />
        <Image
          src="/images/nurtured-oven-flowers-logo-transparent.png"
          alt=""
          aria-hidden="true"
          width={220}
          height={280}
          className="menu-hero__botanical menu-hero__botanical--right"
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10 text-center">
          <p className="font-accent text-eyebrow text-lg mb-2">
            this week&apos;s preorder menu
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
            {menu.weekLabel}
          </h1>
          <Divider icon="flourish" className="mt-4 mb-2" />
          <p className="text-muted text-lg font-body max-w-xl mx-auto leading-relaxed">
            {menu.cutoffText}
          </p>
          <p className="mt-2 text-caption text-sm font-body">
            {menu.fulfillmentText}
          </p>
        </div>
      </div>
    </>
  )
}
