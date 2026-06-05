export default function AdminPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      <div className="h-10 w-64 max-w-full rounded-soft bg-oatmeal/50" />
      <div className="h-4 w-96 max-w-full rounded bg-oatmeal/40" />
      <div className="flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-3xl">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-warm-white border border-oatmeal/50"
            />
          ))}
        </div>
      </div>
      <div className="h-64 rounded-2xl bg-oatmeal/30 ring-1 ring-inset ring-oatmeal/45" />
    </div>
  )
}
