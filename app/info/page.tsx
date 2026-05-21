// app/info/page.tsx
"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Wifi, LogOut, UtensilsCrossed } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function InfoPage() {
  const router = useRouter();
  
  // 1. HOOKS DULU
  const { user, logout } = useAuthStore();

  // 2. LOGIC
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // 3. UI
  return (
    <div className="min-h-screen bg-warm-cream pb-24">
      <div className="max-w-md mx-auto px-6 pt-8">
        
        {/* Header Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-warm-brown rounded-full mx-auto flex items-center justify-center shadow-soft mb-4">
            <UtensilsCrossed size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-warm-brown">Opo Ana Ne</h1>
          <p className="text-text-secondary text-sm">Warm Local Culinary Experience</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-card shadow-soft flex items-start gap-4">
            <div className="bg-soft-caramel/20 p-2.5 rounded-card">
              <MapPin size={20} className="text-warm-brown" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm mb-1">Lokasi Restoran</h3>
              <p className="text-text-secondary text-sm leading-relaxed">Jl. Contoh Javanese No. 123, Kota Kita, Jawa Tengah 50123</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-card shadow-soft flex items-start gap-4">
            <div className="bg-soft-caramel/20 p-2.5 rounded-card">
              <Clock size={20} className="text-warm-brown" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm mb-1">Jam Buka</h3>
              <p className="text-text-secondary text-sm leading-relaxed">Senin - Minggu</p>
              <p className="text-warm-brown font-semibold text-sm">10:00 - 22:00 WIB</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-card shadow-soft flex items-start gap-4">
            <div className="bg-soft-caramel/20 p-2.5 rounded-card">
              <Wifi size={20} className="text-warm-brown" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm mb-1">WiFi Gratis</h3>
              <p className="text-text-secondary text-sm">Nama: OpoAnaNe_Wifi</p>
              <p className="text-text-secondary text-sm">Password: makanenak123</p>
            </div>
          </div>
        </div>

        {/* Logout Button (Hanya muncul kalau yang buka adalah Staff yang login) */}
        {user && (
          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full bg-white border border-error-red/20 text-error-red font-semibold py-3 rounded-card hover:bg-error-red/5 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout Akun Staff
            </button>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}