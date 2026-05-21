// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllMenus, deleteMenu, updateMenu, createMenu, getDailyStats, getAvailableMenuCount } from "@/lib/api/admin";
import { getCategories } from "@/lib/api/menu";
import { useAuthStore } from "@/store/useAuthStore";
import MenuFormModal from "@/components/MenuFormModal";
import CategoryFormModal from "@/components/CategoryFormModal";
import { Settings, PlusCircle, Pencil, Trash2, UtensilsCrossed, Users, DollarSign, ShoppingBag, Tag, Package, TrendingUp } from "lucide-react";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";
const getValidImageUrl = (url: string | null | undefined) => {
  if (!url) return FALLBACK_IMG;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return FALLBACK_IMG;
};

export default function AdminPage() {
  // 1. HOOKS DULU
  const { role, loading: authLoading } = useAuthStore();
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [stats, setStats] = useState({ revenue: 0, orders: 0, menuCount: 0 });

  const fetchInitialData = async () => {
    setLoading(true);
    const [menusData, catsData, dailyStats, menuCount] = await Promise.all([
      getAllMenus(), getCategories(), getDailyStats(), getAvailableMenuCount()
    ]);
    setMenus(menusData || []);
    setCategories(catsData || []);
    setStats({ revenue: dailyStats?.revenue || 0, orders: dailyStats?.orders || 0, menuCount: menuCount || 0 });
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && role === "admin") fetchInitialData();
  }, [authLoading, role]);

  if (authLoading || loading) return <div className="flex h-screen items-center justify-center text-warm-brown font-bold bg-warm-cream">Loading...</div>;
  if (role !== "admin") return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-warm-cream">
      <p className="text-error-red font-bold text-lg">Akses Ditolak</p>
      <Link href="/" className="text-warm-brown underline font-semibold">&larr; Kembali</Link>
    </div>
  );

  const handleToggleAvailability = async (menuId: string, currentStatus: boolean) => {
    setActionLoading(menuId);
    try { await updateMenu(menuId, { is_available: !currentStatus }); await fetchInitialData(); } 
    catch { alert("Gagal ubah status"); } finally { setActionLoading(null); }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm("Hapus menu ini?")) return;
    setActionLoading(menuId);
    try { await deleteMenu(menuId); await fetchInitialData(); } 
    catch { alert("Gagal hapus"); } finally { setActionLoading(null); }
  };

  const openAddMenuModal = () => { setEditingMenu(null); setIsMenuModalOpen(true); };
  const openEditMenuModal = (menu: any) => { setEditingMenu(menu); setIsMenuModalOpen(true); };

  const handleSaveMenu = async (formData: any) => {
    if (editingMenu) await updateMenu(editingMenu.id, formData); else await createMenu(formData);
    await fetchInitialData();
  };

  return (
    <div className="min-h-screen bg-[#F3ECE0] p-8 md:p-10 antialiased"> {/* Background lebih warm dan soft */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-warm-brown p-2 rounded-xl shadow-md">
                <Settings className="text-soft-caramel" size={24} />
              </div>
              <h1 className="text-4xl font-bold text-warm-brown tracking-tight">Dashboard</h1>
            </div>
            <p className="text-text-secondary text-lg pl-1">Ringkasan bisnis & manajemen restoran</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setIsCategoryModalOpen(true)} className="bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl font-semibold text-sm text-warm-brown hover:bg-white transition-all duration-200 shadow-sm border border-black/5 flex items-center gap-2">
              <Tag size={16} /> Kategori
            </button>
            <Link href="/admin/staff" className="bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl font-semibold text-sm text-warm-brown hover:bg-white transition-all duration-200 shadow-sm border border-black/5 flex items-center gap-2">
              <Users size={16} /> Staff
            </Link>
            <button onClick={openAddMenuModal} className="bg-warm-brown text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-[#6A4225] transition-all duration-200 shadow-lg shadow-warm-brown/20 flex items-center gap-2">
              <PlusCircle size={16} /> Tambah Menu
            </button>
          </div>
        </div>

        {/* Stats Cards - PREMIUM STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-white to-leaf-green/5 p-7 rounded-3xl border border-black/5 shadow-[0_10px_40px_-15px_rgba(79,111,82,0.2)] flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300">
            <div className="bg-leaf-green/10 p-4 rounded-2xl border border-leaf-green/10">
              <DollarSign size={28} className="text-leaf-green" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium mb-1 flex items-center gap-1"><TrendingUp size={14} className="text-leaf-green" /> Pendapatan Hari Ini</p>
              <h2 className="text-3xl font-bold text-text-primary tracking-tight">Rp {stats.revenue.toLocaleString('id-ID')}</h2>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-soft-caramel/10 p-7 rounded-3xl border border-black/5 shadow-[0_10px_40px_-15px_rgba(217,160,102,0.3)] flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300">
            <div className="bg-soft-caramel/10 p-4 rounded-2xl border border-soft-caramel/10">
              <ShoppingBag size={28} className="text-soft-caramel" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium mb-1">Total Pesanan</p>
              <h2 className="text-3xl font-bold text-text-primary tracking-tight">{stats.orders} <span className="text-lg font-medium text-text-secondary">Order</span></h2>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-warm-brown/5 p-7 rounded-3xl border border-black/5 shadow-[0_10px_40px_-15px_rgba(122,78,45,0.3)] flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300">
            <div className="bg-warm-brown/10 p-4 rounded-2xl border border-warm-brown/10">
              <Package size={28} className="text-warm-brown" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium mb-1">Menu Tersedia</p>
              <h2 className="text-3xl font-bold text-text-primary tracking-tight">{stats.menuCount} <span className="text-lg font-medium text-text-secondary">Menu</span></h2>
            </div>
          </div>
        </div>

        {/* Tabel Menu - PREMIUM STYLE */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-black/5 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-7 border-b border-black/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-warm-brown flex items-center gap-3">
              <UtensilsCrossed size={22} className="text-soft-caramel" /> Daftar Menu
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="p-5 pl-7 font-semibold text-xs text-text-secondary uppercase tracking-wider">Menu</th>
                  <th className="p-5 font-semibold text-xs text-text-secondary uppercase tracking-wider hidden md:table-cell">Kategori</th>
                  <th className="p-5 font-semibold text-xs text-text-secondary uppercase tracking-wider">Harga</th>
                  <th className="p-5 font-semibold text-xs text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="p-5 pr-7 font-semibold text-xs text-text-secondary uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {menus.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-text-secondary">Belum ada menu</td></tr>
                ) : (
                  menus.map((menu) => (
                    <tr key={menu?.id} className="border-b border-black/5 last:border-0 hover:bg-warm-cream/30 transition-colors duration-200 group">
                      <td className="p-5 pl-7">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-warm-cream flex-shrink-0 shadow-sm border border-black/5">
                            <Image src={getValidImageUrl(menu?.image)} alt={menu?.name || "Menu"} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <span className="font-semibold text-text-primary text-sm">{menu?.name || "Menu"}</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-text-secondary hidden md:table-cell font-medium">{menu?.categories?.name || "-"}</td>
                      <td className="p-5 text-sm text-text-primary font-bold">Rp {(menu?.price || 0).toLocaleString('id-ID')}</td>
                      <td className="p-5">
                        <button
                          onClick={() => handleToggleAvailability(menu?.id, menu?.is_available)}
                          disabled={actionLoading === menu?.id}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${menu?.is_available ? "bg-leaf-green/10 text-leaf-green hover:bg-leaf-green/20" : "bg-error-red/10 text-error-red hover:bg-error-red/20"}`}
                        >
                          {menu?.is_available ? "Tersedia" : "Habis"}
                        </button>
                      </td>
                      <td className="p-5 pr-7 text-right">
                        <div className="flex gap-1 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditMenuModal(menu)} className="p-2.5 text-warm-brown hover:bg-warm-cream rounded-xl transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteMenu(menu?.id)} disabled={actionLoading === menu?.id} className="p-2.5 text-error-red hover:bg-error-red/5 rounded-xl transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MenuFormModal isOpen={isMenuModalOpen} onClose={() => setIsMenuModalOpen(false)} onSubmit={handleSaveMenu} categories={categories} initialData={editingMenu} />
      <CategoryFormModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onSuccess={fetchInitialData} />
    </div>
  );
}