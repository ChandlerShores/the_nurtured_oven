import Link from "next/link"
import { notFound } from "next/navigation"
import AdminOrderCustomerEmail from "@/components/admin/AdminOrderCustomerEmail"
import StatusPill from "@/components/admin/ui/StatusPill"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import { adminBtnSecondary } from "@/components/admin/ui/admin-button"
import { fetchCustomerEmailsForOrder } from "@/lib/google-sheets/customer-emails"
import { findOrderByInternalRef } from "@/lib/google-sheets/orders"

export const dynamic = "force-dynamic"

interface PageProps {
  params: { internalRef: string }
}

function formatMethod(method: string): string {
  if (method === "delivery") return "Delivery"
  if (method === "pickup") return "Pickup"
  return method || "—"
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const internalRef = decodeURIComponent(params.internalRef).trim()
  const order = await findOrderByInternalRef(internalRef)
  if (!order) {
    notFound()
  }

  let emailHistory: Awaited<ReturnType<typeof fetchCustomerEmailsForOrder>> = []
  try {
    emailHistory = await fetchCustomerEmailsForOrder(internalRef)
  } catch {
    emailHistory = []
  }

  return (
    <>
      <SectionHeader
        title={order.customerName || "Order"}
        subtitle={order.internalRef}
        action={
          <Link
            href="/admin/orders"
            className={adminBtnSecondary}
          >
            ← All orders
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <DashboardCard title="Order details">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-caption text-xs uppercase tracking-wide">Email</dt>
              <dd className="text-charcoal mt-0.5">{order.customerEmail || "—"}</dd>
            </div>
            <div>
              <dt className="text-caption text-xs uppercase tracking-wide">Phone</dt>
              <dd className="text-charcoal mt-0.5">{order.customerPhone || "—"}</dd>
            </div>
            <div>
              <dt className="text-caption text-xs uppercase tracking-wide">Items</dt>
              <dd className="text-charcoal mt-0.5">{order.itemsSummary || "—"}</dd>
            </div>
            <div>
              <dt className="text-caption text-xs uppercase tracking-wide">Fulfillment</dt>
              <dd className="mt-1 flex flex-wrap gap-2 items-center">
                <span>{formatMethod(order.fulfillmentMethod)}</span>
                <StatusPill status={order.orderStatus || "New"} />
              </dd>
            </div>
            {order.fulfillmentMethod === "delivery" && order.deliveryAddress ? (
              <div>
                <dt className="text-caption text-xs uppercase tracking-wide">Address</dt>
                <dd className="text-charcoal mt-0.5">
                  {order.deliveryAddress}
                  {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
                </dd>
              </div>
            ) : null}
            {order.dietary ? (
              <div>
                <dt className="text-caption text-xs uppercase tracking-wide">Dietary</dt>
                <dd className="text-charcoal mt-0.5">{order.dietary}</dd>
              </div>
            ) : null}
          </dl>
        </DashboardCard>
      </div>

      <AdminOrderCustomerEmail
        order={order}
        initialHistory={emailHistory}
      />
    </>
  )
}
