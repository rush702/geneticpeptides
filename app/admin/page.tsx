import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const role = user.user_metadata?.role;

  if (role !== "admin" && !email.endsWith("@pepassure.com")) {
    redirect("/?error=unauthorized");
  }

  const service = createServiceClient();
  const { data: claims } = await service!
    .from("profiles")
    .select("id, user_id, vendor_name, contact_email, status, created_at, website_url, tier")
    .order("created_at", { ascending: false })
    .limit(100);

  const pending = claims?.filter((c) => c.status === "pending").length ?? 0;
  const approved = claims?.filter((c) => c.status === "verified" || c.tier !== "free").length ?? 0;
  const total = claims?.length ?? 0;

  return (
    <main className="min-h-screen bg-ink p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display text-white mb-2">Admin Dashboard</h1>
        <p className="text-ink-3 mb-8">Signed in as {email}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-ink-2 rounded-xl p-6 border border-white/10">
            <p className="text-ink-3 text-sm mb-1">Pending Claims</p>
            <p className="text-3xl font-bold text-white">{pending}</p>
          </div>
          <div className="bg-ink-2 rounded-xl p-6 border border-white/10">
            <p className="text-ink-3 text-sm mb-1">Total Vendors</p>
            <p className="text-3xl font-bold text-white">{total}</p>
          </div>
          <div className="bg-ink-2 rounded-xl p-6 border border-white/10">
            <p className="text-ink-3 text-sm mb-1">Verified</p>
            <p className="text-3xl font-bold text-emerald">{approved}</p>
          </div>
        </div>

        <div className="bg-ink-2 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Vendor Claims</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-ink-3 font-medium px-6 py-3">Vendor</th>
                  <th className="text-left text-ink-3 font-medium px-6 py-3">Email</th>
                  <th className="text-left text-ink-3 font-medium px-6 py-3">Website</th>
                  <th className="text-left text-ink-3 font-medium px-6 py-3">Status</th>
                  <th className="text-left text-ink-3 font-medium px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {claims?.map((claim) => (
                  <tr key={claim.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4 text-white font-medium">{claim.vendor_name ?? "—"}</td>
                    <td className="px-6 py-4 text-ink-3">{claim.contact_email ?? "—"}</td>
                    <td className="px-6 py-4 text-ink-3 truncate max-w-[200px]">
                      {claim.website_url ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          claim.status === "verified"
                            ? "bg-emerald/20 text-emerald"
                            : claim.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {claim.status ?? "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-3">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!claims || claims.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-ink-3">
                      No vendor claims yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
