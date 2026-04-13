#!/usr/bin/env node
// Check Supabase tables via REST API (no dependencies)
const SUPABASE_URL = process.env.SUPABASE_URL || "https://atyaqyotrntnfchhdzvw.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_KEY) {
  console.error("Error: Set SUPABASE_SERVICE_ROLE_KEY env variable first.");
  process.exit(1);
}

const tables = ["claim_requests", "sales_inquiries", "vendor_claims", "vendor_scores", "profiles"];

for (const table of tables) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=0`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "count=exact",
      },
    });
    const count = res.headers.get("content-range");
    if (res.ok) {
      console.log(`✅ ${table}: exists (range: ${count})`);
    } else {
      const body = await res.json();
      console.log(`❌ ${table}: ${res.status} — ${body.message || JSON.stringify(body)}`);
    }
  } catch (err) {
    console.log(`❌ ${table}: ${err.message}`);
  }
}
