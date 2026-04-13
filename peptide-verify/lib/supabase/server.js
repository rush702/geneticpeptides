/**
 * Supabase Server Client
 *
 * Used in Server Components, Server Actions, and Route Handlers.
 * Reads cookies from the Next.js request to maintain the auth session.
 *
 * Required env vars in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from Server Components where cookies
            // can't be set — this is safe to ignore.
          }
        },
      },
    }
  );
}
