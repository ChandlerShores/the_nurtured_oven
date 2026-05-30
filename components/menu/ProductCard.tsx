import Image from "next/image"
import type { MenuProduct } from "@/lib/content/menu-types"
import {
  getDisabledOrderMessage,
  resolveProductOrderHref,
} from "@/lib/menu/ordering"
import MenuOrderButton from "@/components/menu/MenuOrderButton"

interface ProductCardProps {
  product: MenuProduct
  orderingOpen?: boolean
}

export default function ProductCard({
  product,
  orderingOpen = false,
}: ProductCardProps) {
  const orderHref = resolveProductOrderHref(orderingOpen, product)
  const buttonLabel = product.orderButtonText ?? `Order ${product.name}`

  return (
    <article
      className={`bg-warm-white rounded-2xl border border-linen/40 shadow-gentle flex flex-col overflow-hidden ${
        product.soldOut ? "opacity-80" : ""
      }`}
    >
      {product.image && (
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      )}

      <div className="p-6 sm:p-7 flex flex-col flex-1">
        {product.roleLabel && (
          <span className="inline-block bg-oatmeal/70 text-espresso/80 text-xs font-medium px-3 py-1 rounded-full w-fit mb-3 tracking-wide uppercase">
            {product.roleLabel}
          </span>
        )}
        <h3 className="font-heading text-xl text-espresso tracking-wide mb-2">
          {product.name}
        </h3>
        <p className="text-muted-sm text-sm leading-relaxed font-body flex-1">
          {product.description}
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

        {product.limitedQuantity && !product.soldOut && (
          <p className="mt-3 text-xs font-body text-blush">
            {product.limitedQuantityNote ?? "Limited quantity"}
          </p>
        )}

        <p className="font-heading text-base text-espresso mt-4 mb-5">
          {product.priceLabel}
        </p>

        <div className="mt-auto">
          <MenuOrderButton
            href={orderHref}
            orderingOpen={orderingOpen}
            soldOut={product.soldOut}
            disabledMessage={getDisabledOrderMessage()}
            size="md"
          >
            {buttonLabel}
          </MenuOrderButton>
        </div>
      </div>
    </article>
  )
}
