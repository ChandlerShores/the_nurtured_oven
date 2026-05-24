import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ | The Nurtured Oven",
  description:
    "Answers to common questions about weekly ordering, Comfort Boxes, Little Extras, payment, delivery, allergens, and more.",
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
