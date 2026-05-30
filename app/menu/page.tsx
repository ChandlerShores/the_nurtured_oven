import type { Metadata } from "next"
import "./menu-curate.css"
import { currentMenu } from "@/lib/content/currentMenu"
import { isMenuOpen } from "@/lib/menu/ordering"
import MenuHero from "@/components/menu/MenuHero"
import FeaturedProduct from "@/components/menu/FeaturedProduct"
import OrderingStrip from "@/components/menu/OrderingStrip"
import SupportingMenuItems from "@/components/menu/SupportingMenuItems"
import OrderCTA from "@/components/menu/OrderCTA"
import ClosedMenuCTA from "@/components/menu/ClosedMenuCTA"
import LittleExtrasCallout from "@/components/menu/LittleExtrasCallout"

export const metadata: Metadata = {
  title: `${currentMenu.weekLabel} | The Nurtured Oven`,
  description:
    "Order this week's small-batch comfort sweets. Free Friday pickup or local delivery in Georgetown & Lexington. Order by Wednesday at noon.",
}

export default function MenuPage() {
  const orderingOpen = isMenuOpen()

  return (
    <div className="bg-cream">
      <MenuHero menu={currentMenu} />
      <FeaturedProduct
        product={currentMenu.featured}
        orderingOpen={orderingOpen}
      />
      {orderingOpen && <OrderingStrip menu={currentMenu} />}
      <SupportingMenuItems menu={currentMenu} orderingOpen={orderingOpen} />
      {currentMenu.littleExtrasCallout && (
        <LittleExtrasCallout callout={currentMenu.littleExtrasCallout} />
      )}
      {orderingOpen ? (
        <OrderCTA menu={currentMenu} />
      ) : (
        <ClosedMenuCTA menu={currentMenu} />
      )}
    </div>
  )
}
