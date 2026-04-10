"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Mail, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      router.push(redirect);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-emerald" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">Sign In</h1>
        <p className="text-sm text-gray-500 mt-1">Access your vendor dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 bg-ink-2 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
            />
          </div>
        </div>
        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-ink-2 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-glow w-full py-3 bg-emerald text-white font-medium rounded-lg hover:bg-emerald-light disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 molecular-bg">
      <Suspense
        fallback={
          <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
