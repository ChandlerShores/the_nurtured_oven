import Image from "next/image"
import type { MenuProduct } from "@/lib/content/menu-types"

interface ProductCardProps {
  product: MenuProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article
      className={`bg-warm-white rounded-xl border border-linen/30 shadow-gentle flex flex-col overflow-hidden ${
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-heading text-lg text-espresso tracking-wide mb-2">
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

        {product.soldOut && (
          <p className="mt-3 text-sm font-body text-muted-sm italic">
            Sold out this week
          </p>
        )}

        <p className="font-heading text-base text-espresso mt-4">
          {product.priceLabel}
        </p>
      </div>
    </article>
  )
}
