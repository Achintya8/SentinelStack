// SECURITY FIX: centralized fail-closed admin allowlist check.
// Returns true only when ADMIN_EMAILS is set AND the given email is in the list.
// If the env var is missing/empty, this returns false — access denied — so that
// a misconfiguration cannot accidentally grant admin to every authenticated user.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS;
  if (!raw || !raw.trim()) return false;

  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);

  if (allowed.length === 0) return false;
  return allowed.includes(email.trim().toLowerCase());
}
