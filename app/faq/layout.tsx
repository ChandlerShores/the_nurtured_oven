import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ | The Nurtured Oven",
  description:
    "Answers to common questions about ordering, delivery, gifting, allergens, and more from The Nurtured Oven.",
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
