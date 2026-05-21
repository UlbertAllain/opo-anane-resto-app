// app/detail/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMenuById } from "@/lib/api/menu";
import { useCartStore, Addon } from "@/store/useCartStore";
import { ChevronLeft, Plus as PlusIcon, Minus as MinusIcon, Flame, Check, ShoppingBag } from "lucide-react";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";
const getValidImageUrl = (url: string | null | undefined) => {
  if (!url) return FALLBACK_IMG;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return FALLBACK_IMG;
};

function MenuDetailContent() {
  const searchParams = useSearchParams();
  const menuId = searchParams.get("id"); // Ambil ID dari ?id=xxx

  // 1. HOOKS DULU
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSpicyLevel, setSelectedSpicyLevel] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [notes, setNotes] = useState("");
  
  const addItem = useCartStore((state) => state.addItem);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    if (menuId) {
      const fetchMenu = async () => {
        setLoading(true);
        const data = await getMenuById(menuId);
        setMenu(data);
        // Set default spicy level jika ada
        if (data?.spicy_levels && data.spicy_levels.length > 0) {
          setSelectedSpicyLevel(data.spicy_levels[1] || data.spicy_levels[0]);
        }
        setLoading(false);
      };
      fetchMenu();
    } else {
      setLoading(false);
    }
  }, [menuId]);

  // 2. LOGIC
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-warm-brown font-bold bg-warm-cream">Memuat Detail...</div>;
  }

  if (!menu) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-text-primary bg-warm-cream">
        <p className="text-lg">Menu tidak ditemukan</p>
        <Link href="/" className="text-warm-brown underline font-semibold">&larr; Kembali ke Home</Link>
      </div>
    );
  }

  const handleToggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) return prev.filter((a) => a.id !== addon.id);
      return [...prev, addon];
    });
  };

  const calculateTotalPrice = () => {
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + (addon?.price || 0), 0);
    return ((menu?.price || 0) + addonsPrice) * quantity;
  };

  const handleAddToCart = () => {
    addItem({
      id: menu.id,
      name: menu?.name || "Menu",
      price: menu?.price || 0,
      image: getValidImageUrl(menu?.image),
      quantity: quantity,
      spicyLevel: selectedSpicyLevel,
      addons: selectedAddons,
      notes: notes,
    });
    alert("Ditambahkan ke keranjang!");
  };

  // 3. UI (PREMIUM STYLE)
  return (
    <div className="min-h-screen bg-warm-cream pb-28 relative">
      
      {/* Top Image Section */}
      <div className="relative w-full h-[340px] bg-warm-cream">
        <Image
          src={getValidImageUrl(menu?.image)}
          alt={menu?.name || "Menu"}
          fill
          className="object-cover"
          priority
        />
        {/* Back Button & Cart Overlay */}
        <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center z-10">
          <Link href="/" className="bg-white/90 backdrop-blur-sm p-2.5 rounded-2xl shadow-sm border border-black/5 hover:bg-white transition-colors">
            <ChevronLeft size={20} className="text-warm-brown" />
          </Link>
          <Link href="/cart" className="relative bg-white/90 backdrop-blur-sm p-2.5 rounded-2xl shadow-sm border border-black/5 hover:bg-white transition-colors">
            <ShoppingBag size={20} className="text-warm-brown" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-error-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Content Section (Overlapping Image) */}
      <div className="bg-white rounded-t-[2rem] -mt-6 relative z-10 p-7 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] border-t border-black/5">
        
        {/* Title, Rating, Sold */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">{menu?.name || "Menu"}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary font-medium">
            <span>⭐ {menu?.rating || "4.5"}</span>
            <span>•</span>
            <span>Terjual {menu?.sold || 0}+</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-secondary text-sm leading-relaxed mb-8">
          {menu?.description || "Nikmati kelezatan autentik yang bikin nagih, dibuat dengan bahan segar pilihan dan resep turun-temurun."}
        </p>

        {/* Spicy Level Section */}
        {menu?.spicy_levels && menu.spicy_levels.length > 0 && (
          <div className="mb-7">
            <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2 text-sm">
              <Flame size={16} className="text-error-red" /> Level Pedas
            </h3>
            <div className="flex flex-wrap gap-2">
              {menu.spicy_levels.map((level: string) => (
                <button
                  key={level}
                  onClick={() => setSelectedSpicyLevel(level)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-200 ${
                    selectedSpicyLevel === level
                      ? "bg-warm-brown text-white border-warm-brown shadow-sm"
                      : "bg-white text-text-secondary border-black/5 hover:border-warm-brown/30"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Addons / Toppings Section */}
        {menu?.menu_addons && menu.menu_addons.length > 0 && (
          <div className="mb-7">
            <h3 className="font-bold text-text-primary mb-3 text-sm">Tambah Topping</h3>
            <div className="space-y-3">
              {menu.menu_addons.map((addon: any) => {
                const isSelected = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => handleToggleAddon({ id: addon.id, name: addon.name, price: addon.price })}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected ? "border-warm-brown bg-warm-cream/50 shadow-sm" : "border-black/5 bg-white hover:border-warm-brown/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected ? "bg-warm-brown border-warm-brown" : "border-black/20"
                      }`}>
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="font-medium text-text-primary text-sm">{addon?.name || "Addon"}</span>
                    </div>
                    <span className="font-bold text-sm text-soft-caramel">+Rp {(addon?.price || 0).toLocaleString('id-ID')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="mb-4">
          <h3 className="font-bold text-text-primary mb-3 text-sm">Catatan</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Kurangi gula, tanpa bawang..."
            className="w-full bg-warm-cream/50 border border-black/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-warm-brown/20 focus:border-warm-brown/30 placeholder:text-text-secondary/40 resize-none h-20 transition-all"
          />
        </div>

      </div>

      {/* Bottom Sticky CTA (Premium Floating) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-black/5 p-5 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3 bg-warm-cream rounded-2xl p-2 border border-black/5">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))} 
              className="bg-white p-2 rounded-xl shadow-sm hover:bg-warm-cream transition-colors border border-black/5"
            >
              <MinusIcon size={14} className="text-warm-brown" strokeWidth={2.5} />
            </button>
            <span className="font-bold text-text-primary w-5 text-center text-sm">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)} 
              className="bg-white p-2 rounded-xl shadow-sm hover:bg-warm-cream transition-colors border border-black/5"
            >
              <PlusIcon size={14} className="text-warm-brown" strokeWidth={2.5} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 bg-warm-brown text-white py-4 rounded-2xl font-bold text-sm hover:bg-soft-caramel active:scale-[0.98] transition-all shadow-md flex justify-between items-center px-6"
          >
            <span>Tambah</span>
            <span>Rp {calculateTotalPrice().toLocaleString('id-ID')}</span>
          </button>
        </div>
      </div>

    </div>
  );
}

// BUNGKUS DENGAN SUSPENSE (WAJIB karena ada useSearchParams)
export default function MenuDetailPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-warm-brown font-bold bg-warm-cream">Loading...</div>}>
      <MenuDetailContent />
    </Suspense>
  );
}