"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const email = user.email ?? "";
  const role = user.user_metadata?.role;
  if (role !== "admin" && !email.endsWith("@pepassure.com")) {
    redirect("/?error=unauthorized");
  }
}

export async function approveClaim(id: string) {
  await requireAdmin();
  const service = createServiceClient();
  const { error } = await service!
    .from("profiles")
    .update({ status: "verified" })
    .eq("id", id);
  if (error) throw new Error("Failed to approve claim");
  revalidatePath("/admin");
}

export async function rejectClaim(id: string) {
  await requireAdmin();
  const service = createServiceClient();
  const { error } = await service!
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", id);
  if (error) throw new Error("Failed to reject claim");
  revalidatePath("/admin");
}
