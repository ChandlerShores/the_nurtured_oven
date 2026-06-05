import type { Metadata } from "next"
import "./menu-curate.css"
import { getCurrentMenu } from "@/lib/content/load-menu"
import { isMenuOpenAsync } from "@/lib/menu/ordering"
import MenuHero from "@/components/menu/MenuHero"
import FeaturedProduct from "@/components/menu/FeaturedProduct"
import OrderingStrip from "@/components/menu/OrderingStrip"
import SupportingMenuItems from "@/components/menu/SupportingMenuItems"
import OrderCTA from "@/components/menu/OrderCTA"
import ClosedMenuCTA from "@/components/menu/ClosedMenuCTA"

export async function generateMetadata(): Promise<Metadata> {
  const menu = await getCurrentMenu()
  return {
    title: `${menu.weekLabel} | The Nurtured Oven`,
    description:
      "Order this week's small-batch comfort sweets. Free Friday pickup or local delivery in Georgetown & Lexington. Order by Wednesday at noon.",
  }
}

export default async function MenuPage() {
  const menu = await getCurrentMenu()
  const orderingOpen = await isMenuOpenAsync()

  return (
    <div className="bg-cream">
      <MenuHero menu={menu} />
      <FeaturedProduct
        product={menu.featured}
        orderingOpen={orderingOpen}
      />
      {orderingOpen && <OrderingStrip menu={menu} />}
      <SupportingMenuItems menu={menu} orderingOpen={orderingOpen} />
      {orderingOpen ? (
        <OrderCTA menu={menu} />
      ) : (
        <ClosedMenuCTA menu={menu} />
      )}
    </div>
  )
}
