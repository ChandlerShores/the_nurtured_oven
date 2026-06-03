interface EmptyStateProps {
  title: string
  message: string
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-soft bg-linen/50 border border-oatmeal/40 px-4 py-8 text-center">
      <p className="font-medium text-charcoal">{title}</p>
      <p className="text-caption text-sm mt-2 max-w-md mx-auto">{message}</p>
    </div>
  )
}
