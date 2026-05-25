import { fulfillmentPolicy } from "@/lib/content/fulfillment"

interface FulfillmentPolicyNoteProps {
  className?: string
}

export default function FulfillmentPolicyNote({
  className = "",
}: FulfillmentPolicyNoteProps) {
  return (
    <ul
      className={`list-disc pl-4 space-y-0.5 text-xs text-muted leading-snug font-body ${className}`}
    >
      {fulfillmentPolicy.customerFacingBullets.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  )
}
