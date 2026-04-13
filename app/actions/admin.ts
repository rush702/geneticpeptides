"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/** Verify the calling user is an admin. Returns user_id or error. */
async function requireAdmin(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Use service client to bypass RLS and check admin status
  const service = createServiceClient();
  const client = service || supabase;

  const { data: profile } = await client
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) return { error: "Admin access required" };

  return { userId: user.id };
}

export async function approveClaim(profileId: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const service = createServiceClient();
  if (!service) return { error: "Server misconfigured" };

  const { error } = await service
    .from("profiles")
    .update({ status: "approved", verified_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function rejectClaim(profileId: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const service = createServiceClient();
  if (!service) return { error: "Server misconfigured" };

  const { error } = await service
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateVendorTier(
  profileId: string,
  tier: "free" | "pro" | "pro_plus" | "enterprise"
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const service = createServiceClient();
  if (!service) return { error: "Server misconfigured" };

  const { error } = await service
    .from("profiles")
    .update({ tier, upgraded_at: tier !== "free" ? new Date().toISOString() : null })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleAdmin(profileId: string, isAdmin: boolean) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const service = createServiceClient();
  if (!service) return { error: "Server misconfigured" };

  const { error } = await service
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true };
}
