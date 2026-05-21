// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { UtensilsCrossed } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const { user, role, loading, fetchUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      if (role === "admin") router.push("/admin");
      else if (role === "chef") router.push("/kitchen");
      else if (role === "cashier") router.push("/cashier");
      else router.push("/");
    }
  }, [user, role, loading, router]);

  if (loading || (user && role)) {
    return <div className="flex h-screen items-center justify-center bg-warm-cream text-warm-brown font-bold">Redirecting...</div>;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error?.message || "Terjadi kesalahan saat login");
      setIsSubmitting(false);
      return;
    }

    await fetchUser();
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-brown rounded-2xl shadow-md mb-4">
            <UtensilsCrossed className="text-soft-caramel" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-warm-brown tracking-tight">Opo Ana Ne</h1>
          <p className="text-text-secondary mt-2">Masuk ke dashboard restoran</p>
        </div>

        {/* Card Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-error-red/10 text-error-red text-sm p-3 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-warm-cream/50 border border-black/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-warm-brown/20 focus:border-warm-brown/30 transition-all placeholder:text-text-secondary/40"
                placeholder="staff@opoanane.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-warm-cream/50 border border-black/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-warm-brown/20 focus:border-warm-brown/30 transition-all placeholder:text-text-secondary/40"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-warm-brown text-white py-3.5 rounded-xl font-bold text-sm hover:bg-soft-caramel transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Belum punya akun staff?{" "}
          <Link href="/register" className="font-bold text-warm-brown hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}