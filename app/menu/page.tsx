// app/menu/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories, getPopularMenus, getMenusByCategory } from "@/lib/api/menu";
import { useCartStore } from "@/store/useCartStore";
import { Search, Plus, ShoppingBag } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";
const getValidImageUrl = (url: string | null | undefined) => {
  if (!url) return FALLBACK_IMG;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return FALLBACK_IMG;
};

export default function FullMenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const addItem = useCartStore((state) => state.addItem);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const catsData = await getCategories();
    setCategories(catsData);
    const menusData = await getPopularMenus(); // Awalnya load semua
    setMenus(menusData);
    setLoading(false);
  };

  const handleCategoryClick = async (catId: string) => {
    setActiveCategory(catId);
    setLoading(true);
    if (catId === "all") {
      const data = await getPopularMenus();
      setMenus(data);
    } else {
      const data = await getMenusByCategory(catId);
      setMenus(data);
    }
    setLoading(false);
  };

  const filteredMenus = menus.filter((menu) =>
    menu?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-warm-cream pb-24">
      <div className="max-w-md mx-auto">
        
        {/* Header & Search */}
        <div className="px-6 pt-8 pb-4 bg-warm-cream sticky top-0 z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-warm-brown">Semua Menu</h1>
            <Link href="/cart" className="relative bg-white p-2.5 rounded-full shadow-soft">
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-error-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
              <ShoppingBag size={20} className="text-warm-brown" />
            </Link>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Cari menu favorit kamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-pill py-3 pl-11 pr-4 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 placeholder:text-text-secondary/50"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleCategoryClick("all")}
              className={`px-5 py-2 rounded-pill text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === "all" ? "bg-warm-brown text-white shadow-soft" : "bg-white text-text-secondary hover:bg-soft-caramel/20"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat?.id || "all")}
                className={`px-5 py-2 rounded-pill text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat?.id ? "bg-warm-brown text-white shadow-soft" : "bg-white text-text-secondary hover:bg-soft-caramel/20"
                }`}
              >
                {cat?.name || "Kategori"}
              </button>
            ))}
          </div>
        </div>

        {/* Menu List */}
        <div className="px-6 py-4 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-text-secondary">Memuat menu...</div>
          ) : filteredMenus.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">Menu tidak ditemukan.</div>
          ) : (
            filteredMenus.map((menu) => (
              <div key={menu.id} className="bg-white rounded-card shadow-soft overflow-hidden flex group">
                <Link href={`/detail?id=${menu.id}`} className="relative w-28 h-28 bg-warm-cream overflow-hidden flex-shrink-0">
                  <Image
                    src={getValidImageUrl(menu?.image)}
                    alt={menu?.name || "Menu"}
                    width={112}
                    height={112}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                  <Link href={`/detail?id=${menu.id}`}>
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-tight">{menu?.name || "Menu"}</h3>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-1">{menu?.description || "Enak & Segar"}</p>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-warm-brown">Rp {(menu?.price || 0).toLocaleString('id-ID')}</span>
                    <button
                      onClick={() => addItem({
                          id: menu.id, name: menu?.name || "", price: menu?.price || 0, image: getValidImageUrl(menu?.image),
                          quantity: 0
                      })}
                      className="bg-warm-brown text-white p-1.5 rounded-full hover:bg-soft-caramel transition-colors shadow-soft"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  );
}