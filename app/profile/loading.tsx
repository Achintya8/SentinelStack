import { ProfileDashboardSkeleton } from "@/components/skeleton";

// Shown while the server component awaits the session (a remote Atlas round-trip).
export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <ProfileDashboardSkeleton />
    </main>
  );
}
