import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order & Contact | The Nurtured Oven",
  description:
    "Place a weekly order, request a Comfort Box, sign up for menu reminders, or get in touch with The Nurtured Oven.",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
