// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories, getMenusByCategory, getPopularMenus } from "@/lib/api/menu";
import { useCartStore } from "@/store/useCartStore";
import { Search, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";
const getValidImageUrl = (url: string | null | undefined) => {
  if (!url) return FALLBACK_IMG;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return FALLBACK_IMG;
};

export default function HomePage() {
  // 1. HOOKS DULU
  const [categories, setCategories] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const addItem = useCartStore((state) => state.addItem);
  const totalItems = useCartStore((state) => state.getTotalItems());

    // HOOKS: Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const catsData = await getCategories();
      setCategories(catsData);
      const menusData = await getPopularMenus();
      setMenus(menusData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // HOOKS: Fetch data ketika kategori berubah (INI YANG KEMARIN KELUPAAN)
  useEffect(() => {
    const fetchMenuByCat = async () => {
      setLoading(true);
      if (activeCategory === "all") {
        const data = await getPopularMenus();
        setMenus(data || []);
      } else {
        const data = await getMenusByCategory(activeCategory);
        setMenus(data || []);
      }
      setLoading(false);
    };

    // Jangan fetch pas pertama kali load (sudah dihandle useEffect atas)
    if (activeCategory !== "all" || menus.length > 0) {
       fetchMenuByCat();
    }
  }, [activeCategory]);

  // 2. CONDITIONAL RETURN
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-warm-brown font-bold">Memuat Menu...</div>;
  }

  // 3. LOGIC & UI
  const handleAddToCart = (menu: any) => {
    addItem({
      id: menu.id,
      name: menu?.name || "Menu",
      price: menu?.price || 0,
      image: getValidImageUrl(menu?.image),
      quantity: 1 
    });
  };

  return (
    <div className="min-h-screen bg-warm-cream pb-24">
      <div className="max-w-md mx-auto">
        
        {/* Top Section: Greeting & Search */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-text-secondary text-sm">Selamat datang di 👋</p>
              <h1 className="text-2xl font-bold text-warm-brown">Opo Ana Ne</h1>
            </div>
            <Link href="/cart" className="relative bg-white p-2.5 rounded-full shadow-soft">
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-error-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
              <img src="/shopping-bag.svg" alt="Cart" className="w-5 h-5 text-warm-brown" /> {/* Ganti pakai Lucide kalau error */}
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Cari menu favorit kamu..."
              className="w-full bg-white rounded-pill py-3 pl-11 pr-4 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 placeholder:text-text-secondary/50"
            />
          </div>
        </div>

        {/* Hero Banner */}
        <div className="px-6 mb-6">
          <div className="relative h-40 rounded-card overflow-hidden shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800" // Foto makanan cozy
              alt="Promo Banner"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-warm-brown/80 to-transparent flex flex-col justify-center pl-6">
              <h2 className="text-white font-bold text-lg">Nasi Bakar Spesial</h2>
              <p className="text-soft-caramel text-sm mb-2">Diskon 20% Hari Ini!</p>
              <button className="bg-soft-caramel text-warm-brown font-bold text-xs px-4 py-1.5 rounded-pill w-fit hover:bg-white transition-colors">
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Category Section: Horizontal Pills */}
        <div className="px-6 mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2 rounded-pill text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === "all"
                  ? "bg-warm-brown text-white shadow-soft"
                  : "bg-white text-text-secondary hover:bg-soft-caramel/20"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat?.id || "all")}
                className={`px-5 py-2 rounded-pill text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat?.id
                    ? "bg-warm-brown text-white shadow-soft"
                    : "bg-white text-text-secondary hover:bg-soft-caramel/20"
                }`}
              >
                {cat?.name || "Kategori"}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Menu: Large Vertical Cards */}
        <div className="px-6 mb-4">
          <h2 className="text-lg font-bold text-text-primary mb-4">🔥 Paling Laris</h2>
          <div className="grid grid-cols-2 gap-4">
            {menus.map((menu) => (
              <div key={menu.id} className="bg-white rounded-card shadow-soft overflow-hidden flex flex-col group">
                <Link href={`/detail?id=${menu.id}`} className="block">
                  <div className="relative w-full h-32 bg-warm-cream overflow-hidden">
                    <Image
                      src={getValidImageUrl(menu?.image)}
                      alt={menu?.name || "Menu"}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-tight min-h-[2.5rem]">
                    {menu?.name || "Menu"}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                    {menu?.description || "Enak & Segar"}
                  </p>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-warm-brown">
                      Rp {(menu?.price || 0).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => handleAddToCart(menu)}
                      className="bg-warm-brown text-white p-1.5 rounded-full hover:bg-soft-caramel transition-colors shadow-soft"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}