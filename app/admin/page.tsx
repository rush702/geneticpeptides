import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const email = session.user.email ?? '';
  const role = session.user.user_metadata?.role;

  if (role !== 'admin' && !email.endsWith('@pepassure.com')) {
    redirect('/?error=unauthorized');
  }

  const { data: claims } = await supabase
    .from('claim_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen bg-ink p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display text-white mb-2">Admin Dashboard</h1>
        <p className="text-ink-3 mb-8">Signed in as {email}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-ink-2 rounded-xl p-6 border border-white/10">
            <p className="text-ink-3 text-sm mb-1">Pending Claims</p>
            <p className="text-3xl font-bold text-white">
              {claims?.filter((c) => c.status === 'pending').length ?? 0}
            </p>
          </div>
          <div className="bg-ink-2 rounded-xl p-6 border border-white/10">
            <p className="text-ink-3 text-sm mb-1">Total Claims</p>
            <p className="text-3xl font-bold text-white">{claims?.length ?? 0}</p>
          </div>
          <div className="bg-ink-2 rounded-xl p-6 border border-white/10">
            <p className="text-ink-3 text-sm mb-1">Approved</p>
            <p className="text-3xl font-bold text-emerald">
              {claims?.filter((c) => c.status === 'approved').length ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-ink-2 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Recent Claim Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-ink-3 font-medium px-6 py-3">Vendor</th>
                  <th className="text-left text-ink-3 font-medium px-6 py-3">Email</th>
                  <th className="text-left text-ink-3 font-medium px-6 py-3">Status</th>
                  <th className="text-left text-ink-3 font-medium px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {claims?.map((claim) => (
                  <tr key={claim.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4 text-white">{claim.vendor_name ?? claim.vendor_id}</td>
                    <td className="px-6 py-4 text-ink-3">{claim.contact_email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={\`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${claim.status === 'approved' ? 'bg-emerald/20 text-emerald' : claim.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}\`}
                      >
                        {claim.status ?? 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-3">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!claims || claims.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-ink-3">
                      No claim requests yet.
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
