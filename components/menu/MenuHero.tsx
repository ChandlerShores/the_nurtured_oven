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

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10 text-center">
        <p className="font-accent text-brown-sugar/60 text-lg mb-2">
          made fresh every week
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
          {menu.weekLabel}
        </h1>
        <Divider icon="heart" className="mt-4 mb-2" />
        <p className="text-brown-sugar/70 text-lg font-body max-w-xl mx-auto leading-relaxed">
          {menu.cutoffText}
        </p>
        <p className="mt-2 text-brown-sugar/50 text-sm font-body">
          {menu.fulfillmentText}
        </p>
      </div>
    </>
  )
}
