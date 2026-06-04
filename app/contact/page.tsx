import { Suspense } from "react"
import ContactPageContent from "@/components/contact/ContactPageContent"
import { buildWeeklyCatalog } from "@/lib/order/catalog-build"
import { getCurrentMenu } from "@/lib/content/load-menu"
import { resolvePrefillSlugFromCatalog } from "@/lib/contact/prefill"
import { getOrderingPublicStateAsync } from "@/lib/menu/ordering-gate"

interface ContactPageProps {
  searchParams?: { item?: string }
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const ordering = await getOrderingPublicStateAsync()
  const menu = await getCurrentMenu()
  const catalog = buildWeeklyCatalog(menu)
  const prefillSlug = resolvePrefillSlugFromCatalog(
    searchParams?.item ?? "",
    catalog,
    menu.featured.slug
  )

  return (
    <Suspense
      fallback={
        <div className="bg-cream min-h-[50vh] flex items-center justify-center text-caption font-body">
          Loading...
        </div>
      }
    >
      <ContactPageContent
        weeklyOrderingAvailable={ordering.weeklyOrderIntentAvailable}
        orderingClosedMessage={ordering.closedMessage}
        catalog={catalog}
        featuredSlug={menu.featured.slug}
        prefillSlug={prefillSlug}
      />
    </Suspense>
  )
}
