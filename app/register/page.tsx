// app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { UtensilsCrossed } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const { user, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="flex h-screen items-center justify-center bg-warm-cream text-warm-brown font-bold">Redirecting...</div>;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error?.message || "Gagal register");
      setIsSubmitting(false);
      return;
    }

    alert("Registrasi berhasil! Silakan login.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-brown rounded-2xl shadow-md mb-4">
            <UtensilsCrossed className="text-soft-caramel" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-warm-brown tracking-tight">Buat Akun</h1>
          <p className="text-text-secondary mt-2">Daftar untuk melacak pesanan</p>
        </div>

        {/* Card Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-error-red/10 text-error-red text-sm p-3 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-warm-cream/50 border border-black/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-warm-brown/20 focus:border-warm-brown/30 transition-all placeholder:text-text-secondary/40"
                placeholder="Masukkan nama panggilan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-warm-cream/50 border border-black/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-warm-brown/20 focus:border-warm-brown/30 transition-all placeholder:text-text-secondary/40"
                placeholder="email@contoh.com"
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
                placeholder="Min. 6 karakter"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-warm-brown text-white py-3.5 rounded-xl font-bold text-sm hover:bg-soft-caramel transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-warm-brown hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}