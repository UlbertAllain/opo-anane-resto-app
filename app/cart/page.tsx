// app/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { createOrder } from "@/lib/api/orders";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag, UtensilsCrossed, Package } from "lucide-react";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";
const getValidImageUrl = (url: string | null | undefined) => {
  if (!url) return FALLBACK_IMG;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return FALLBACK_IMG;
};

export default function CartPage() {
  const router = useRouter();

  // 1. HOOKS DULU
  const { items, removeItem, updateQuantity, clearCart, orderType, setOrderType, tableNumber, setTableNumber, getTotalPrice } = useCartStore();
  
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. LOGIC
  const totalPrice = getTotalPrice();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(null);

    if (!customerName.trim()) {
      setError("Mohon masukkan nama Anda untuk pemesanan.");
      return;
    }

    if (items.length === 0) {
      setError("Keranjang Anda masih kosong.");
      return;
    }

    if (orderType === "dine-in" && (!tableNumber || tableNumber <= 0)) {
      setError("Mohon masukkan nomor meja yang valid untuk Dine-in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderCode = await createOrder({
        customerName: customerName,
        items: items,
        orderType: orderType,
        tableNumber: orderType === "dine-in" ? tableNumber : null,
        totalPrice: totalPrice,
      });

      clearCart();
      router.push(`/track?code=${orderCode}`);

    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. UI
  return (
    <div className="min-h-screen bg-warm-cream pb-32 relative">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-soft-caramel/10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="text-warm-brown p-1 hover:bg-warm-cream rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-text-primary">Keranjang</h1>
          <button onClick={clearCart} className="text-error-red text-xs font-semibold hover:underline">Hapus Semua</button>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="max-w-md mx-auto p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-error-red/10 border border-error-red/30 p-3 rounded-card text-sm text-error-red font-medium">
            {error}
          </div>
        )}

        {/* List Item Keranjang */}
        {items.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <ShoppingBag size={48} className="text-text-secondary/30" />
            <p className="text-text-secondary">Keranjang Anda masih kosong.</p>
            <Link href="/" className="bg-warm-brown text-white px-6 py-2 rounded-button text-sm font-bold hover:bg-soft-caramel transition-colors">
              Pesan Sekarang
            </Link>
          </div>
        ) : (
          <>
            {items.map((item, index) => {
              const itemTotalPrice = ((item?.price || 0) + (item?.addons || []).reduce((s, a) => s + (a?.price || 0), 0)) * (item?.quantity || 0);
              
              return (
                <div key={`${item.id}-${index}`} className="bg-white p-4 rounded-card shadow-soft flex gap-4 relative group">
                  <div className="relative w-20 h-20 rounded-card overflow-hidden bg-warm-cream flex-shrink-0">
                    <Image src={getValidImageUrl(item?.image)} alt={item?.name || "Menu"} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-bold text-text-primary text-sm truncate">{item?.name || "Menu"}</h3>
                      
                      {/* Detail Customization (Spicy, Addons, Notes) */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item?.spicyLevel && (
                          <span className="bg-error-red/10 text-error-red text-[10px] font-semibold px-2 py-0.5 rounded-pill">
                            🌶️ {item.spicyLevel}
                          </span>
                        )}
                        {(item?.addons || []).map((addon) => (
                          <span key={addon.id} className="bg-soft-caramel/10 text-warm-brown text-[10px] font-semibold px-2 py-0.5 rounded-pill">
                            + {addon.name}
                          </span>
                        ))}
                      </div>
                      {item?.notes && (
                        <p className="text-[10px] text-text-secondary italic mt-1 truncate">Catatan: {item.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-warm-brown text-sm">Rp {itemTotalPrice.toLocaleString('id-ID')}</span>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          className="bg-warm-cream p-1 rounded-full hover:bg-soft-caramel/30 transition-colors"
                        >
                          <Minus size={12} className="text-warm-brown" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{item?.quantity || 0}</span>
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          className="bg-warm-cream p-1 rounded-full hover:bg-soft-caramel/30 transition-colors"
                        >
                          <Plus size={12} className="text-warm-brown" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button 
                    type="button" 
                    onClick={() => removeItem(item.id)} 
                    className="absolute top-2 right-2 text-text-secondary/30 hover:text-error-red transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}

            {/* Form Data Pemesan & Order Type */}
            <div className="bg-white p-6 rounded-card shadow-soft space-y-5">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Nama Pemesan</label>
                <input
                  type="text"
                  placeholder="Masukkan nama Anda"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-warm-cream/50 border border-soft-caramel/20 rounded-button px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 placeholder:text-text-secondary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Tipe Pesanan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType("dine-in")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-button border-2 font-semibold text-sm transition-colors ${
                      orderType === "dine-in" ? "bg-warm-brown text-white border-warm-brown shadow-soft" : "bg-white text-text-secondary border-soft-caramel/20 hover:border-soft-caramel"
                    }`}
                  >
                    <UtensilsCrossed size={16} /> Dine-in
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("takeaway")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-button border-2 font-semibold text-sm transition-colors ${
                      orderType === "takeaway" ? "bg-warm-brown text-white border-warm-brown shadow-soft" : "bg-white text-text-secondary border-soft-caramel/20 hover:border-soft-caramel"
                    }`}
                  >
                    <Package size={16} /> Takeaway
                  </button>
                </div>
              </div>

              {orderType === "dine-in" && (
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">Nomor Meja</label>
                  <input
                    type="number"
                    placeholder="Contoh: 5"
                    value={tableNumber || ""}
                    onChange={(e) => setTableNumber(parseInt(e.target.value) || null)}
                    className="w-full bg-warm-cream/50 border border-soft-caramel/20 rounded-button px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 placeholder:text-text-secondary/50"
                    required
                  />
                </div>
              )}
            </div>
          </>
        )}
      </form>

      {/* Floating Checkout Button */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-soft-caramel/10 p-4 shadow-[0_-4px_20px_rgba(122,78,45,0.1)]">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Total Pembayaran</span>
              <span className="text-xl font-bold text-warm-brown">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-leaf-green text-white py-4 rounded-button font-bold text-sm hover:bg-leaf-green/90 transition-colors shadow-soft disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Memproses..." : (<><ShoppingBag size={18} /> Buat Pesanan</>)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}