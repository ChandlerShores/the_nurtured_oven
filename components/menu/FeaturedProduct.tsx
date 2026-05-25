import Image from "next/image"
import type { FeaturedMenuProduct } from "@/lib/content/menu-types"
import {
  getDisabledOrderMessage,
  resolveProductOrderHref,
} from "@/lib/menu/ordering"
import MenuOrderButton from "@/components/menu/MenuOrderButton"

interface FeaturedProductProps {
  product: FeaturedMenuProduct
  orderingOpen: boolean
}

export default function FeaturedProduct({
  product,
  orderingOpen,
}: FeaturedProductProps) {
  const orderHref = resolveProductOrderHref(orderingOpen, product)
  const buttonLabel = product.orderButtonText ?? `Order ${product.name}`

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-12">
      <div className="bg-warm-white rounded-2xl border border-linen/30 shadow-warm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[320px] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>
          <div className="p-8 sm:p-10 lg:pl-2 lg:pr-12 flex flex-col justify-center">
            <span className="inline-block bg-blush/20 text-blush text-xs font-medium px-3 py-1 rounded-full w-fit mb-4 tracking-wide">
              Featured
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide mb-3">
              {product.name}
            </h2>
            <p className="text-muted text-lg leading-relaxed font-body mb-2">
              {product.description}
            </p>
            <p className="text-caption text-sm font-body mb-1">
              {product.includes}
            </p>
            {product.allergenTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.allergenTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-oatmeal/60 text-muted px-2.5 py-0.5 rounded-full border border-linen/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {product.limitedQuantity && (
              <p className="mt-3 text-xs font-body text-blush">
                {product.limitedQuantityNote ?? "Limited quantity this week"}
              </p>
            )}
            <p className="font-heading text-xl text-espresso mt-4 mb-6">
              {product.priceLabel}
            </p>
            <div>
              <MenuOrderButton
                href={orderHref}
                orderingOpen={orderingOpen}
                soldOut={product.soldOut}
                disabledMessage={getDisabledOrderMessage()}
                size="lg"
              >
                {buttonLabel}
              </MenuOrderButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
