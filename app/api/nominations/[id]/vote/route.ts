import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { createHash } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: nominationId } = await params;

  if (!nominationId) {
    return NextResponse.json({ error: "Missing nomination ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // For anonymous users, fingerprint by hashed IP
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headersList.get("x-real-ip")
    || "unknown";
  const ipFingerprint = createHash("sha256").update(ip + nominationId).digest("hex");

  // Check for duplicate vote
  let existing;
  if (user) {
    const { data } = await supabase
      .from("nomination_votes")
      .select("id")
      .eq("nomination_id", nominationId)
      .eq("user_id", user.id)
      .maybeSingle();
    existing = data;
  } else {
    const { data } = await supabase
      .from("nomination_votes")
      .select("id")
      .eq("nomination_id", nominationId)
      .eq("ip_fingerprint", ipFingerprint)
      .maybeSingle();
    existing = data;
  }

  if (existing) {
    return NextResponse.json({ ok: false, error: "Already voted" }, { status: 409 });
  }

  const { error } = await supabase.from("nomination_votes").insert({
    nomination_id: nominationId,
    user_id: user?.id ?? null,
    ip_fingerprint: ipFingerprint,
  });

  if (error) {
    // Unique constraint violation = race condition duplicate
    if (error.code === "23505") {
      return NextResponse.json({ ok: false, error: "Already voted" }, { status: 409 });
    }
    console.error("[Nominations] vote insert error:", error);
    return NextResponse.json({ ok: false, error: "Vote failed" }, { status: 500 });
  }

  // Return the updated count
  const { count } = await supabase
    .from("nomination_votes")
    .select("*", { count: "exact", head: true })
    .eq("nomination_id", nominationId);

  return NextResponse.json({ ok: true, voteCount: count ?? 0 });
}
