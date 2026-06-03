export default function AdminPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      <div className="h-10 w-64 max-w-full rounded-soft bg-oatmeal/50" />
      <div className="h-4 w-96 max-w-full rounded bg-oatmeal/40" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 rounded-softer bg-warm-white border border-oatmeal/40"
          />
        ))}
      </div>
      <div className="h-64 rounded-softer bg-warm-white border border-oatmeal/40" />
    </div>
  )
}
