// Skeleton placeholders matching actual component layouts to reduce cumulative layout shift (CLS) and make state transitions feel smoother.

export function StudentProfileSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse shadow-sm mb-5">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-5">
        <div className="h-7 bg-slate-100 rounded-lg w-20" />
        <div className="h-7 bg-slate-100 rounded-lg w-16" />
        <div className="h-7 bg-slate-100 rounded-lg w-28" />
      </div>
      <div className="h-2 bg-slate-100 rounded-full" />
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </div>
        <div className="h-5 w-16 bg-slate-100 rounded-full ml-3 flex-shrink-0" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-4 bg-slate-100 rounded w-28" />
        <div className="h-8 bg-slate-100 rounded-lg w-28" />
      </div>
    </div>
  )
}

export function MessagesSummarySkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse shadow-sm">
      <div className="h-5 bg-slate-200 rounded w-40 mb-5" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
          <div className="w-0.5 bg-slate-200 rounded self-stretch flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
            <div className="h-3 bg-slate-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
