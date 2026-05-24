import type { Metadata } from "next"
import { currentMenu } from "@/lib/content/currentMenu"
import { isMenuOpen } from "@/lib/menu/ordering"
import MenuHero from "@/components/menu/MenuHero"
import FeaturedProduct from "@/components/menu/FeaturedProduct"
import ProductGrid from "@/components/menu/ProductGrid"
import OrderCTA from "@/components/menu/OrderCTA"
import ClosedMenuCTA from "@/components/menu/ClosedMenuCTA"
import LittleExtrasCallout from "@/components/menu/LittleExtrasCallout"

export const metadata: Metadata = {
  title: `${currentMenu.weekLabel} | The Nurtured Oven`,
  description:
    "Order this week's small-batch comfort sweets. Free Friday pickup or local delivery in Georgetown & Lexington — order by Wednesday at noon.",
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
      <ProductGrid menu={currentMenu} />
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
