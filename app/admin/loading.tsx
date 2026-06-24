import { Skeleton } from "@/components/skeleton";

// Shown while the admin server component awaits the session check.
export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </section>

        <Skeleton className="h-9 w-80" />

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="h-[560px] w-full rounded-xl" />
          <div className="space-y-2.5 rounded-xl border border-cyan-300/15 bg-slate-950/85 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
