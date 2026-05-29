import Divider from "@/components/ui/Divider"
import ProductCard from "@/components/menu/ProductCard"
import type { CurrentMenu } from "@/lib/content/menu-types"

interface SupportingMenuItemsProps {
  menu: CurrentMenu
  orderingOpen: boolean
}

export default function SupportingMenuItems({
  menu,
  orderingOpen,
}: SupportingMenuItemsProps) {
  if (menu.items.length === 0) return null

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 sm:pb-24">
      <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide text-center mb-2">
        {menu.itemsSectionTitle}
      </h2>
      <Divider icon="dot" className="mt-2 mb-10" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {menu.items.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            orderingOpen={orderingOpen}
          />
        ))}
      </div>
    </div>
  )
}
