"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Check if the currently authenticated user is an admin.
 * Uses the service role client to bypass RLS policies,
 * avoiding the infinite recursion in the admin check policy.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Use service client (bypasses RLS) to avoid infinite recursion
  const service = createServiceClient();
  if (!service) return false;

  const { data, error } = await service
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return false;
  return data.is_admin === true;
}

/**
 * Get the current user's profile using service role client.
 * Bypasses RLS to avoid recursion issues.
 */
export async function getMyProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const service = createServiceClient();
  if (!service) return null;

  const { data } = await service
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}
