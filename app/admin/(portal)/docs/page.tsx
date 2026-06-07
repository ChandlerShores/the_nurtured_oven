import Link from "next/link"
import { adminDocCategories, adminDocs } from "@/lib/admin/docs-registry"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import AdminPortalSection from "@/components/admin/ui/AdminPortalSection"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { adminBtnPrimary } from "@/components/admin/ui/admin-button"

export const dynamic = "force-dynamic"

export default function AdminDocsPage() {
  return (
    <>
      <SectionHeader
        title="Docs"
        subtitle="Simple guides for running the bakery website with confidence."
      />

      <div className="pb-4" data-sop="admin-docs-page">
        <DashboardCard className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-xl text-espresso">
                Start with what you need today.
              </h2>
              <p className="text-caption text-sm mt-1 max-w-2xl">
                Use these guides during weekly setup, bake day, customer updates,
                or anytime something feels off.
              </p>
            </div>
            <Link
              href="/admin/docs/emergency-guide"
              className={`${adminBtnPrimary} w-full md:w-auto text-center`}
            >
              Emergency guide
            </Link>
          </div>
        </DashboardCard>

        {adminDocCategories.map((category, index) => {
          const docs = adminDocs.filter((doc) => doc.category === category.id)
          if (docs.length === 0) return null

          return (
            <AdminPortalSection
              key={category.id}
              title={category.title}
              subtitle={category.description}
              first={index === 0}
              collapsible={false}
              dataSop={`admin-docs-section-${category.id}`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {docs.map((doc) => (
                  <DashboardCard key={doc.slug} className="h-full">
                    <article className="flex h-full flex-col gap-4">
                      <div className="space-y-2">
                        <h3 className="font-heading text-lg text-espresso">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-charcoal font-body leading-relaxed">
                          {doc.description}
                        </p>
                        <p className="text-caption text-sm font-body leading-relaxed">
                          <span className="font-semibold text-espresso">
                            Use when:
                          </span>{" "}
                          {doc.whenToUse}
                        </p>
                      </div>

                      <div className="mt-auto">
                        <Link
                          href={`/admin/docs/${doc.slug}`}
                          className={`${adminBtnPrimary} w-full text-center`}
                          data-sop="admin-doc-open-guide"
                        >
                          Open guide
                        </Link>
                      </div>
                    </article>
                  </DashboardCard>
                ))}
              </div>
            </AdminPortalSection>
          )
        })}
      </div>
    </>
  )
}
