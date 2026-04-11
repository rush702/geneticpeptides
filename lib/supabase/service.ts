import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-side operations that bypass RLS.
 * Use ONLY in server-only code (API routes, server actions) — never in client code.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Return a stub that won't crash during build
    return null;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
