// Presentational skeleton placeholder. No hooks, so it works in both server
// components (route loading.tsx) and client components. Theme-aware: the base
// uses the slate token (flips light/dark) and the sheen uses white/10 (which
// inverts to a dark sheen in light mode).
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-md bg-slate-800/60 ${className}`}
    >
      <span className="absolute inset-0 animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

// A run of text-line skeletons of decreasing width.
export function SkeletonText({
  lines = 3,
  className = ""
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-3/4", "w-2/3"];
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

// Card-shaped block used by the route-level loading fallbacks.
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-cyan-300/15 bg-slate-950/80 p-6 ${className}`}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-7 w-2/3" />
      <Skeleton className="mt-3 h-3.5 w-1/2" />
    </div>
  );
}

// Full profile-dashboard skeleton. Shared by the /profile route fallback
// (loading.tsx) and the client session-pending state so they match exactly.
export function ProfileDashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-[1fr_0.75fr]">
        <SkeletonCard />
        <SkeletonCard />
      </section>

      <section className="rounded-lg border border-cyan-300/15 bg-slate-950/80">
        <div className="flex items-center justify-between border-b border-cyan-300/10 px-5 py-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-cyan-300/15 bg-slate-950/80 p-5">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="mt-4 h-24 w-full" />
      </section>
    </div>
  );
}
