// app/kitchen/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getKitchenOrders, updateOrderStatus } from "@/lib/api/kitchen";
import { getOrdersByDate } from "@/lib/api/reports";
import { exportOrdersToExcel } from "@/lib/api/export";
import { useAuthStore } from "@/store/useAuthStore";
import { UtensilsCrossed, Package, Flame, FileText, CheckCircle2, XCircle, Clock, Download, History } from "lucide-react";
import ExportModal from "@/components/Exportmodal";

export default function KitchenPage() {
  // 1. HOOKS DULU
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [historyDate, setHistoryDate] = useState<string>("");
  const { fullName } = useAuthStore();
    const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchActiveOrders = async () => {
    if (!historyDate) { // Hanya fetch live kalau tidak mode history
      const data = await getKitchenOrders();
      setActiveOrders(data || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    const supabase = createClient();
    const channel = supabase
      .channel("kitchen-orders-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchActiveOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [historyDate]);

  useEffect(() => {
    if (historyDate) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        const data = await getOrdersByDate(historyDate);
        setHistoryOrders(data || []);
        setLoadingHistory(false);
      };
      fetchHistory();
    } else {
      setHistoryOrders([]);
    }
  }, [historyDate]);

  // 2. LOGIC
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try { await updateOrderStatus(orderId, newStatus); } 
    catch (error) { alert("Gagal update status pesanan"); } 
    finally { setUpdatingId(null); }
  };

    const handleExport = () => {
    setIsExportOpen(true);
  };

  // 3. CONDITIONAL RETURN
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-warm-brown font-bold bg-warm-cream">Memuat Pesanan...</div>;
  }

  const displayedOrders = historyDate ? historyOrders : activeOrders;

  // 4. UI
  return (
    <div className="min-h-screen bg-warm-cream p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-warm-brown flex items-center gap-2">
            <UtensilsCrossed className="text-soft-caramel" /> Kitchen Display
          </h1>
          <p className="text-text-secondary">Halo, Chef <span className="font-semibold text-warm-brown">{fullName || "Kita"}</span>! Semangat masaknya!</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {/* Date Picker History */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-card shadow-soft border border-soft-caramel/20">
            <History size={16} className="text-warm-brown" />
            <input 
              type="date" 
              value={historyDate} 
              onChange={(e) => setHistoryDate(e.target.value)} 
              className="bg-transparent text-sm text-text-primary focus:outline-none cursor-pointer"
            />
            {historyDate && (
              <button onClick={() => setHistoryDate("")} className="text-xs text-error-red font-semibold hover:underline">Live</button>
            )}
          </div>

                    <button onClick={handleExport} className="bg-leaf-green text-white px-4 py-2.5 rounded-button font-semibold text-sm hover:bg-leaf-green/90 transition-colors shadow-soft flex items-center gap-2 whitespace-nowrap">
            <Download size={16} /> Export Laporan
          </button>
        </div>
        
      </div>

      {/* Status Label */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded-pill text-xs font-bold ${historyDate ? 'bg-soft-caramel/20 text-warm-brown' : 'bg-leaf-green/20 text-leaf-green'}`}>
          {historyDate ? `Mode Riwayat: ${historyDate}` : "Mode Live (Pesanan Aktif)"}
        </span>
      </div>

      {loadingHistory ? (
         <div className="text-center py-20 text-text-secondary">Memuat riwayat...</div>
      ) : displayedOrders.length === 0 ? (
        <div className="text-center py-20 text-text-secondary flex flex-col items-center gap-2">
          <CheckCircle2 size={48} className="text-leaf-green opacity-50" />
          <span className="text-xl">{historyDate ? "Tidak ada pesanan di tanggal ini" : "Semua pesanan selesai diproses ☕"}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedOrders.map((order) => (
            <div key={order?.id} className={`bg-white rounded-card shadow-soft overflow-hidden border-t-4 ${
              order?.status === "pending" ? "border-yellow-500" : 
              order?.status === "preparing" ? "border-blue-500" : 
              order?.status === "completed" ? "border-leaf-green" :
              order?.status === "cancelled" ? "border-error-red" : "border-gray-300"
            }`}>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
                <div>
                  <h2 className="font-bold text-lg text-text-primary flex items-center gap-2">
                    {order?.order_type === "dine-in" ? <UtensilsCrossed size={18} className="text-warm-brown" /> : <Package size={18} className="text-soft-caramel" />}
                    {order?.order_type === "dine-in" ? `Meja ${order?.table_number || "-"}` : "Bungkus"}
                  </h2>
                  <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                    <Clock size={12} /> {new Date(order?.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                    <span className="ml-1">• {order?.customer_name || "Customer"}</span>
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-pill text-xs font-bold uppercase ${
                  order?.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                  order?.status === "preparing" ? "bg-blue-100 text-blue-700" : 
                  order?.status === "completed" ? "bg-green-100 text-green-700" :
                  order?.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {order?.status}
                </span>
              </div>

              <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                {(order?.order_items || []).map((item: any) => (
                  <div key={item?.id} className="flex gap-2">
                    <span className="bg-warm-cream text-warm-brown font-bold text-sm w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0">
                      {item?.quantity || 0}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{item?.menu_name || "Menu"}</p>
                      {item?.selected_spicy_level && (
                        <p className="text-xs text-error-red flex items-center gap-1 mt-0.5">
                          <Flame size={10} /> {item.selected_spicy_level}
                        </p>
                      )}
                      {item?.notes && (
                        <p className="text-xs text-text-secondary italic flex items-center gap-1 mt-0.5">
                          <FileText size={10} /> {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Aksi hanya muncul di Mode Live */}
              {!historyDate && (
                <div className="p-4 bg-warm-cream/50 border-t border-gray-100 flex gap-2">
                  {order?.status === "pending" && (
                    <>
                      <button onClick={() => handleUpdateStatus(order?.id, "cancelled")} disabled={updatingId === order?.id} className="flex-1 py-2.5 rounded-button bg-white text-error-red font-semibold text-sm border border-error-red/20 hover:bg-red-50 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                        <XCircle size={14} /> Batal
                      </button>
                      <button onClick={() => handleUpdateStatus(order?.id, "preparing")} disabled={updatingId === order?.id} className="flex-1 py-2.5 rounded-button bg-leaf-green text-white font-semibold text-sm hover:bg-leaf-green/90 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                        <UtensilsCrossed size={14} /> Masak
                      </button>
                    </>
                  )}
                  {order?.status === "preparing" && (
                    <button onClick={() => handleUpdateStatus(order?.id, "completed")} disabled={updatingId === order?.id} className="w-full py-2.5 rounded-button bg-warm-brown text-white font-semibold text-sm hover:bg-soft-caramel transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                      <CheckCircle2 size={14} /> Selesai & Sajikan
                    </button>
                  )}
                  
                </div>
              )}
              
            </div>
          ))}
          
        </div>
        
      )}
            {/* Export Modal */}
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        userRole="Kitchen" 
      />
    </div>
  );
}