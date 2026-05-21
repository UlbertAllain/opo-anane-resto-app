// app/detail/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Ganti useSearchParams jadi useParams
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

export default function MenuDetailPage() {
  const params = useParams();
  const menuId = params.id as string; // Ambil ID dari URL

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

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-warm-brown font-bold">Memuat Detail...</div>;
  }

  if (!menu) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-text-primary">
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

  return (
    <div className="min-h-screen bg-warm-cream pb-28 relative">
      <div className="relative w-full h-[320px] bg-warm-cream">
        <Image src={getValidImageUrl(menu?.image)} alt={menu?.name || "Menu"} fill className="object-cover" priority />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <Link href="/" className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-soft hover:bg-white transition-colors">
            <ChevronLeft size={20} className="text-warm-brown" />
          </Link>
          <Link href="/cart" className="relative bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-soft hover:bg-white transition-colors">
            <ShoppingBag size={20} className="text-warm-brown" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-error-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-t-[30px] -mt-6 relative z-10 p-6 shadow-soft">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text-primary">{menu?.name || "Menu"}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
            <span>⭐ {menu?.rating || "4.5"}</span>
            <span>•</span>
            <span>Terjual {menu?.sold || 0}+</span>
          </div>
        </div>

        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          {menu?.description || "Nikmati kelezatan autentik yang bikin nagih, dibuat dengan bahan segar pilihan dan resep turun-temurun."}
        </p>

        {menu?.spicy_levels && menu.spicy_levels.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
              <Flame size={18} className="text-error-red" /> Level Pedas
            </h3>
            <div className="flex flex-wrap gap-2">
              {menu.spicy_levels.map((level: string) => (
                <button
                  key={level}
                  onClick={() => setSelectedSpicyLevel(level)}
                  className={`px-4 py-2 rounded-pill text-sm font-medium border-2 transition-colors ${
                    selectedSpicyLevel === level ? "bg-warm-brown text-white border-warm-brown" : "bg-white text-text-secondary border-soft-caramel/30 hover:border-soft-caramel"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {menu?.menu_addons && menu.menu_addons.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-text-primary mb-3">Tambah Topping</h3>
            <div className="space-y-3">
              {menu.menu_addons.map((addon: any) => {
                const isSelected = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => handleToggleAddon({ id: addon.id, name: addon.name, price: addon.price })}
                    className={`w-full flex items-center justify-between p-3 rounded-card border-2 transition-colors ${
                      isSelected ? "border-warm-brown bg-warm-cream/50" : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "bg-warm-brown border-warm-brown" : "border-gray-300"
                      }`}>
                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="font-medium text-text-primary text-sm">{addon?.name || "Addon"}</span>
                    </div>
                    <span className="font-semibold text-sm text-soft-caramel">+Rp {(addon?.price || 0).toLocaleString('id-ID')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-bold text-text-primary mb-3">Catatan</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Kurangi gula, tanpa bawang..."
            className="w-full bg-warm-cream/50 border border-soft-caramel/20 rounded-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 placeholder:text-text-secondary/50 resize-none h-20"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-soft-caramel/10 p-4 shadow-[0_-4px_20px_rgba(122,78,45,0.1)]">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3 bg-warm-cream rounded-button p-2">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="bg-white p-1.5 rounded-full shadow-soft hover:bg-soft-caramel/20 transition-colors">
              <MinusIcon size={16} className="text-warm-brown" />
            </button>
            <span className="font-bold text-text-primary w-6 text-center">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="bg-white p-1.5 rounded-full shadow-soft hover:bg-soft-caramel/20 transition-colors">
              <PlusIcon size={16} className="text-warm-brown" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 bg-warm-brown text-white py-4 rounded-button font-bold text-sm hover:bg-soft-caramel transition-colors shadow-soft flex justify-between items-center px-5"
          >
            <span>Tambah</span>
            <span>Rp {calculateTotalPrice().toLocaleString('id-ID')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}