// components/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  useEffect(() => {
    // 1. Cek session yang sedang aktif saat pertama kali load
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name") // Ambil role dan full_name
          .eq("id", session.user.id)
          .single();

        useAuthStore.setState({ 
          user: session.user, 
          role: profile?.role || "customer", // UNDEFINED SAFETY
          fullName: profile?.full_name || "Staff", // Simpan fullName, fallback "Staff"
          loading: false 
        });
      } else {
        useAuthStore.setState({ user: null, role: null, fullName: null, loading: false });
      }
    };

    initAuth();

    // 2. Dengarkan perubahan auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name") // Ambil role dan full_name
            .eq("id", session.user.id)
            .single();

          useAuthStore.setState({ 
            user: session.user, 
            role: profile?.role || "customer", // UNDEFINED SAFETY
            fullName: profile?.full_name || "Staff", // Simpan fullName, fallback "Staff"
            loading: false 
          });
        } else {
          useAuthStore.setState({ user: null, role: null, fullName: null, loading: false });
        }
      }
    );

    // Cleanup subscription saat komponen unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return <>{children}</>;
}