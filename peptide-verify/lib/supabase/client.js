/**
 * Supabase Browser Client
 *
 * Used in Client Components (anything with "use client").
 * Reads the anon key and URL from environment variables.
 *
 * Required env vars in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
