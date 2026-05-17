import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getRateLimitIp, pruneExpired } from "@/lib/rate-limit";

export const runtime = "nodejs";

const handlers = toNextJsHandler(auth);

// SECURITY FIX: rate limit state-changing better-auth calls (sign-in, sign-up,
// password-reset, OTP, magic-link, etc.) by IP. GET (session lookups, etc.)
// is left alone.
export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  pruneExpired();
  const ip = getRateLimitIp(request.headers);
  const result = rateLimit({
    key: `auth-api:${ip}`,
    limit: 30,
    windowMs: 60_000
  });

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(result.retryAfterSeconds) }
      }
    );
  }

  return handlers.POST(request);
}
