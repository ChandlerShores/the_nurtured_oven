"use client"

import Image from "next/image"
import type { CurrentMenu } from "@/lib/content/menu-types"

interface AdminMenuPreviewProps {
  menu: CurrentMenu | null
}

export default function AdminMenuPreview({ menu }: AdminMenuPreviewProps) {
  if (!menu) {
    return (
      <p className="text-caption text-sm font-body rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
        No active items to preview. Turn on &quot;Show on website&quot; for at least
        one item.
      </p>
    )
  }

  return (
    <div className="rounded-softer border border-oatmeal/60 bg-warm-white shadow-gentle overflow-hidden">
      <div className="bg-linen/50 px-4 py-2 border-b border-oatmeal/40">
        <p className="text-caption text-xs font-body">
          Customer preview — how the live menu will look
        </p>
      </div>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="relative aspect-[4/3] rounded-soft overflow-hidden bg-oatmeal/30">
            <Image
              src={menu.featured.image}
              alt={menu.featured.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          </div>
          <div>
            <span className="inline-block bg-blush/20 text-blush text-xs font-medium px-3 py-1 rounded-full mb-2">
              {menu.featured.featuredEyebrow ?? "This Week's Feature"}
            </span>
            <h3 className="font-heading text-2xl text-espresso">{menu.featured.name}</h3>
            <p className="text-caption text-sm mt-2">{menu.featured.description}</p>
            <p className="font-medium mt-2">{menu.featured.priceLabel}</p>
          </div>
        </div>

        {menu.items.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menu.items.map((item) => (
              <li
                key={item.slug}
                className="flex gap-3 rounded-soft border border-linen/50 p-3 bg-cream/50"
              >
                {item.image ? (
                  <div className="relative w-16 h-16 shrink-0 rounded-soft overflow-hidden bg-oatmeal/30">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="font-heading text-base text-espresso">{item.name}</p>
                  <p className="text-caption text-xs line-clamp-2">{item.description}</p>
                  <p className="text-sm font-medium mt-1">{item.priceLabel}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
