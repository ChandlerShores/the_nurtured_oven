import { loadAdminWeekData } from "@/lib/admin/load-admin-week"
import {
  buildMessageFeed,
  computeMessageFeedStats,
  type MessageFeedItem,
  type MessageFeedStats,
} from "@/lib/admin/messages-feed"
import { fetchAllCustomerEmailLogs } from "@/lib/google-sheets/customer-emails"

export async function loadAdminMessagesData(weekKey?: string) {
  const weekData = await loadAdminWeekData(weekKey)
  const allLogs = await fetchAllCustomerEmailLogs()
  const items = buildMessageFeed(allLogs, weekData.orders)
  const stats = computeMessageFeedStats(items)

  return {
    ...weekData,
    items,
    stats,
  }
}

export type AdminMessagesLoadResult = Awaited<
  ReturnType<typeof loadAdminMessagesData>
>

export type { MessageFeedItem, MessageFeedStats }
