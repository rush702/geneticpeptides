"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export interface VendorAlert {
  id: string;
  vendor_name: string;
  vendor_slug: string | null;
  alert_type: string;
  severity: string;
  headline: string;
  summary: string;
  banner_text: string | null;
  alternatives: string[];
  link: string | null;
  link_text: string | null;
  is_active: boolean;
  published_at: string;
  expires_at: string | null;
  created_at: string;
}

/** Fetch active alerts — public, no auth needed */
export async function getActiveAlerts(): Promise<VendorAlert[]> {
  const service = createServiceClient();
  const supabase = service || (await createClient());

  const { data, error } = await supabase
    .from("vendor_alerts")
    .select("*")
    .eq("is_active", true)
    .order("severity", { ascending: true }) // critical first
    .order("published_at", { ascending: false });

  if (error) {
    // Table may not exist yet — return empty
    console.warn("[Alerts] fetch failed:", error.message);
    return [];
  }

  return (data as VendorAlert[]) || [];
}

/** Create a new alert (admin only) */
export async function createAlert(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const service = createServiceClient();
  const client = service || supabase;

  // Verify admin
  const { data: profile } = await client
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) return { error: "Admin access required" };

  const vendorName = formData.get("vendor_name") as string;
  const alertType = formData.get("alert_type") as string;
  const severity = formData.get("severity") as string;
  const headline = formData.get("headline") as string;
  const summary = formData.get("summary") as string;
  const bannerText = formData.get("banner_text") as string;
  const alternativesRaw = formData.get("alternatives") as string;
  const link = formData.get("link") as string;
  const linkText = formData.get("link_text") as string;
  const expiresAt = formData.get("expires_at") as string;

  if (!vendorName || !headline || !summary) {
    return { error: "Vendor name, headline, and summary are required." };
  }

  const alternatives = alternativesRaw
    ? alternativesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  const slug = vendorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { error } = await client.from("vendor_alerts").insert({
    vendor_name: vendorName,
    vendor_slug: slug,
    alert_type: alertType || "general",
    severity: severity || "warning",
    headline,
    summary,
    banner_text: bannerText || null,
    alternatives,
    link: link || null,
    link_text: linkText || "View full alert",
    expires_at: expiresAt || null,
    is_active: true,
  });

  if (error) {
    console.error("[Alerts] insert failed:", error);
    return { error: "Failed to create alert." };
  }

  return { success: true };
}

/** Resolve / deactivate an alert (admin only) */
export async function resolveAlert(alertId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const service = createServiceClient();
  const client = service || supabase;

  const { data: profile } = await client
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) return { error: "Admin access required" };

  const { error } = await client
    .from("vendor_alerts")
    .update({ is_active: false })
    .eq("id", alertId);

  if (error) {
    console.error("[Alerts] resolve failed:", error);
    return { error: "Failed to resolve alert." };
  }

  return { success: true };
}
