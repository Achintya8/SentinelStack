import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/db";
import mongoose from "mongoose";
import { Session } from "@/lib/models/session";

export const runtime = "nodejs";

// SECURITY FIX: revoking by id (not by token) so the session token never has to
// travel to the client. We look up the session server-side, verify it belongs to
// the current user, then hand its token to better-auth's revokeSession.
export async function POST(request: NextRequest) {
  const current = await auth.api.getSession({ headers: request.headers });
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Session id is required" }, { status: 400 });
  }

  await connectMongoose();
  const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

  const session = await Session.findOne({
    $or: [{ id }, ...(objectId ? [{ _id: objectId }] : [])]
  }).lean<{ token?: string; userId?: string; id?: string; _id?: unknown }>();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Ownership check — a user may only revoke their own sessions.
  const userIdObj = mongoose.Types.ObjectId.isValid(current.user.id)
    ? new mongoose.Types.ObjectId(current.user.id).toString()
    : null;
  const ownerIds = [current.user.id, userIdObj].filter(Boolean) as string[];
  if (!ownerIds.includes(String(session.userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!session.token) {
    return NextResponse.json({ error: "Session cannot be revoked" }, { status: 400 });
  }

  try {
    await auth.api.revokeSession({
      body: { token: session.token },
      headers: request.headers
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 });
  }
}
