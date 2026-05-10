import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Request an Order | The Nurtured Oven",
  description:
    "Send an order inquiry for fresh-baked cookies, bars, brownies, or gift boxes from The Nurtured Oven.",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
