// app/track/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMyOrder } from "@/lib/api/customer";
import { Search, Package, UtensilsCrossed, Flame, FileText, CheckCircle2, Clock, XCircle, ShoppingBag } from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");

  // 1. HOOKS DULU
  const [orderCode, setOrderCode] = useState(codeFromUrl || "");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (codeFromUrl) {
      handleSearch(codeFromUrl);
    }
  }, [codeFromUrl]);

  // 2. LOGIC
  const handleSearch = async (codeToSearch?: string) => {
    const searchCode = (codeToSearch || orderCode).trim().toUpperCase();
    if (!searchCode) return;

    setLoading(true);
    setHasSearched(true);
    const data = await getMyOrder(searchCode);
    setOrder(data || null);
    setLoading(false);
  };

  const getStatusIndex = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "preparing": return 1;
      case "completed": return 2;
      case "paid": return 3;
      case "cancelled": return -1;
      default: return 0;
    }
  };

  const timelineSteps = [
    { label: "Menunggu Kitchen", icon: Clock },
    { label: "Sedang Dimasak", icon: UtensilsCrossed },
    { label: "Siap Disajikan", icon: CheckCircle2 },
    { label: "Selesai Dibayar", icon: ShoppingBag },
  ];

  // 3. UI
  return (
    <div className="min-h-screen bg-warm-cream p-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-warm-brown">Lacak Pesanan</h1>
          <p className="text-text-secondary text-sm">Masukkan 4 digit Kode Pesanan</p>
        </div>

        {/* Search Form */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Kode Pesanan (cth: A1B2)"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            maxLength={4}
            className="flex-1 bg-white rounded-pill py-3 px-6 text-center text-lg font-bold tracking-widest shadow-soft focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 placeholder:text-text-secondary/50 placeholder:font-normal placeholder:tracking-normal placeholder:text-sm"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-warm-brown text-white px-5 py-3 rounded-pill font-semibold hover:bg-soft-caramel transition-colors disabled:opacity-50 shadow-soft"
          >
            {loading ? "..." : <Search size={20} />}
          </button>
        </div>

        {/* Hasil Pencarian */}
        {hasSearched && !order && !loading && (
          <div className="text-center py-10 text-text-secondary bg-white rounded-card shadow-soft">
            <XCircle size={40} className="mx-auto mb-2 opacity-50" />
            Pesanan tidak ditemukan. Pastikan kode benar.
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Header Kode Pesanan */}
            <div className="bg-warm-brown p-6 rounded-card shadow-soft text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <Package size={120} />
              </div>
              <p className="text-sm opacity-80 mb-1">Kode Pesanan Anda</p>
              <h2 className="text-4xl font-extrabold tracking-widest">{order?.order_code || "----"}</h2>
              <div className="mt-3 flex justify-center gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-pill text-xs font-bold">
                  {order?.order_type === "dine-in" ? "Dine-in" : "Takeaway"}
                </span>
                {order?.order_type === "dine-in" && (
                  <span className="bg-white/20 px-3 py-1 rounded-pill text-xs font-bold">
                    Meja {order?.table_number || "-"}
                  </span>
                )}
              </div>
            </div>

            {/* Timeline Status */}
            {order?.status !== "cancelled" && (
              <div className="bg-white p-6 rounded-card shadow-soft">
                <div className="flex justify-between items-start relative">
                  <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-200 z-0"></div>
                  
                  {timelineSteps.map((step, index) => {
                    const isCompleted = index <= getStatusIndex(order?.status);
                    const isCurrent = index === getStatusIndex(order?.status);
                    const Icon = step.icon;
                    
                    return (
                      <div key={index} className="flex flex-col items-center z-10 relative w-1/4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted ? "bg-leaf-green border-leaf-green text-white" : "bg-white border-gray-200 text-gray-400"
                        } ${isCurrent ? "scale-110 shadow-lg" : ""}`}>
                          <Icon size={18} />
                        </div>
                        <p className={`text-[10px] mt-2 text-center font-medium ${isCompleted ? "text-warm-brown" : "text-text-secondary"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {order?.status === "cancelled" && (
              <div className="bg-error-red/10 border border-error-red/20 p-4 rounded-card text-center text-error-red font-bold flex items-center justify-center gap-2">
                <XCircle size={18} /> Pesanan Dibatalkan
              </div>
            )}

            {/* Detail Pesanan */}
            <div className="bg-white p-6 rounded-card shadow-soft">
              <h3 className="font-bold text-warm-brown mb-4">Detail Pesanan</h3>
              <div className="space-y-4">
                {(order?.order_items || []).map((item: any) => (
                  <div key={item?.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-text-primary">{item?.quantity || 0}x {item?.menu_name || "Menu"}</span>
                      <span className="text-text-secondary font-medium">Rp {(((item?.price || 0)) * (item?.quantity || 0)).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item?.selected_spicy_level && (
                        <span className="text-[10px] bg-error-red/10 text-error-red px-2 py-0.5 rounded-pill flex items-center gap-0.5">
                          <Flame size={8} /> {item.selected_spicy_level}
                        </span>
                      )}
                      {(item?.selected_addons || []).map((addon: any, idx: number) => (
                        <span key={idx} className="text-[10px] bg-soft-caramel/10 text-warm-brown px-2 py-0.5 rounded-pill">
                          + {addon?.name || "Addon"}
                        </span>
                      ))}
                    </div>
                    {item?.notes && (
                      <p className="text-[10px] text-text-secondary italic mt-1 flex items-center gap-1">
                        <FileText size={8} /> {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-warm-cream mt-4 pt-4 flex justify-between font-bold text-warm-brown">
                <span>Total Pembayaran</span>
                <span>Rp {(order?.total_price || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Info Pembayaran */}
            <div className="bg-soft-caramel/10 border border-soft-caramel/30 p-5 rounded-card text-center">
              <h3 className="font-bold text-warm-brown mb-2">Cara Pembayaran</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Pembayaran dilakukan langsung di kasir restoran. Silakan menuju kasir dan tunjukkan <span className="font-bold text-warm-brown">Kode Pesanan</span> Anda di atas untuk melakukan pembayaran (Tunai / QRIS / Debit).
              </p>
            </div>

          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-warm-brown text-sm hover:underline font-semibold">&larr; Kembali ke Menu</Link>
        </div>
      </div>
    </div>
  );
}

// BUNGKUS DENGAN SUSPENSE
export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-warm-brown font-bold">Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}