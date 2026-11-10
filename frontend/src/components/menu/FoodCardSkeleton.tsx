export function FoodCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <div className="aspect-video w-full animate-pulse bg-slate-200" />

      <div className="space-y-3 p-5">
        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />

        <div className="flex items-center justify-between pt-3">
          <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}