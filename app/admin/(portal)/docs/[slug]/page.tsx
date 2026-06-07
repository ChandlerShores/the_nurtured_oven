import Link from "next/link"
import { notFound } from "next/navigation"
import { findAdminDoc } from "@/lib/admin/docs-registry"
import { loadAdminDocMarkdown } from "@/lib/admin/docs-markdown"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { adminBtnSecondary } from "@/components/admin/ui/admin-button"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const doc = findAdminDoc(params.slug)
  return {
    title: doc ? `${doc.title} | Admin Docs` : "Admin Docs",
    robots: { index: false, follow: false },
  }
}

export default async function AdminDocDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const result = await loadAdminDocMarkdown(params.slug)
  if (!result) notFound()

  const { doc, rendered } = result

  return (
    <>
      <SectionHeader title={doc.title} subtitle={doc.description} />
      <div className="pb-8" data-sop="admin-doc-detail-page">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-sm max-w-2xl">
            <span className="font-semibold text-espresso">Use when:</span>{" "}
            {doc.whenToUse}
          </p>
          <Link
            href="/admin/docs"
            className={`${adminBtnSecondary} w-full sm:w-auto text-center`}
          >
            Back to Docs
          </Link>
        </div>

        <article
          className="admin-doc-content rounded-lg bg-warm-white border border-espresso/12 p-5 sm:p-8"
          dangerouslySetInnerHTML={{ __html: rendered.html }}
        />
      </div>
    </>
  )
}
