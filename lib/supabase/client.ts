import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a stub that won't crash during SSR/build when env vars aren't set
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signInWithOtp: async () => ({ error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (_: any, __: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        insert: async () => ({ error: { message: "Supabase not configured" } }),
        update: () => ({ eq: async () => ({ error: { message: "Supabase not configured" } }) }),
      }),
    } as any;
  }

  return createBrowserClient(url, key);
}
