"use client"

import WeeklyDropCards from "@/components/home/WeeklyDropCards"
import { getHomepageDropItems } from "@/lib/content/homepage-menu"
import type { CurrentMenu } from "@/lib/content/menu-types"

interface AdminHomepageDropPreviewProps {
  menu: CurrentMenu | null
}

export default function AdminHomepageDropPreview({
  menu,
}: AdminHomepageDropPreviewProps) {
  if (!menu) {
    return (
      <p className="text-caption text-sm font-body rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
        No active items for the homepage drop. Turn on &quot;Show on website&quot;
        for at least one item.
      </p>
    )
  }

  const dropItems = getHomepageDropItems(menu)

  return (
    <div className="rounded-softer border border-oatmeal/60 bg-warm-white shadow-gentle overflow-hidden">
      <div className="bg-linen/50 px-4 py-2 border-b border-oatmeal/40">
        <p className="text-caption text-xs font-body">
          Homepage — &quot;The weekly drop&quot; (first 3 active items)
        </p>
      </div>
      <div className="p-4 sm:p-6">
        <WeeklyDropCards items={dropItems} linkToMenu={false} />
      </div>
    </div>
  )
}
