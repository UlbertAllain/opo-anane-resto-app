// app/cashier/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCashierOrders, markOrderAsPaid } from "@/lib/api/cashier";
import { getOrdersByDate } from "@/lib/api/reports";
import { useAuthStore } from "@/store/useAuthStore";
import ExportModal from "@/components/Exportmodal";
import { CreditCard, CheckCircle2, UtensilsCrossed, Package, Download, History } from "lucide-react";

export default function CashierPage() {
  // 1. HOOKS DULU
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [historyDate, setHistoryDate] = useState<string>("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { fullName } = useAuthStore();

  const fetchActiveOrders = async () => {
    if (!historyDate) {
      const data = await getCashierOrders();
      setActiveOrders(data || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    const supabase = createClient();
    const channel = supabase
      .channel("cashier-orders-channel")
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
  const handleMarkAsPaid = async (orderId: string) => {
    setPayingId(orderId);
    try { await markOrderAsPaid(orderId); } 
    catch (error) { alert("Gagal menandai pesanan sebagai dibayar"); } 
    finally { setPayingId(null); }
  };

  // 3. CONDITIONAL RETURN
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-warm-brown font-bold bg-warm-cream">Memuat Kasir...</div>;
  }

  const displayedOrders = historyDate ? historyOrders : activeOrders;

  // 4. UI
  return (
    <div className="min-h-screen bg-warm-cream p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-warm-brown flex items-center gap-2">
            <CreditCard className="text-soft-caramel" /> Kasir Dashboard
          </h1>
          <p className="text-text-secondary">Halo, Kasir <span className="font-semibold text-warm-brown">{fullName || "Kita"}</span>! Kelola pembayaran.</p>
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

          <button onClick={() => setIsExportOpen(true)} className="bg-leaf-green text-white px-4 py-2.5 rounded-button font-semibold text-sm hover:bg-leaf-green/90 transition-colors shadow-soft flex items-center gap-2 whitespace-nowrap">
            <Download size={16} /> Export Laporan
          </button>
        </div>
      </div>

      {/* Status Label */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded-pill text-xs font-bold ${historyDate ? 'bg-soft-caramel/20 text-warm-brown' : 'bg-leaf-green/20 text-leaf-green'}`}>
          {historyDate ? `Mode Riwayat: ${historyDate}` : "Mode Live (Siap Bayar)"}
        </span>
      </div>

      {loadingHistory ? (
         <div className="text-center py-20 text-text-secondary">Memuat riwayat...</div>
      ) : displayedOrders.length === 0 ? (
        <div className="text-center py-20 text-text-secondary flex flex-col items-center gap-2">
          <CheckCircle2 size={48} className="text-leaf-green opacity-50" />
          <span className="text-xl">{historyDate ? "Tidak ada pesanan di tanggal ini" : "Belum ada pesanan siap bayar 💰"}</span>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {displayedOrders.map((order) => (
            <div key={order?.id} className="bg-white rounded-card shadow-soft p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-l-4 border-soft-caramel">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-bold text-lg text-text-primary">
                    {order?.order_type === "dine-in" ? <UtensilsCrossed size={18} className="inline mr-1 text-warm-brown" /> : <Package size={18} className="inline mr-1 text-soft-caramel" />}
                    {order?.customer_name || "Customer"} 
                    <span className="text-text-secondary text-sm font-medium ml-1">({order?.order_type === "dine-in" ? `Meja ${order?.table_number || "-"}` : "Bungkus"})</span>
                  </h2>
                  <span className={`px-3 py-1 rounded-pill text-xs font-bold ${order?.status === "completed" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {order?.status === "completed" ? "Siap Bayar" : "Lunas"}
                  </span>
                </div>
                <div className="text-sm text-text-secondary space-y-1 mt-3">
                  {(order?.order_items || []).map((item: any) => (
                    <p key={item?.id}>{item?.quantity || 0}x {item?.menu_name || "Menu"}</p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <div className="text-2xl font-bold text-warm-brown">
                  Rp {(order?.total_price || 0).toLocaleString('id-ID')}
                </div>
                {/* Tombol bayar hanya muncul di Mode Live */}
                {!historyDate && order?.status === "completed" && (
                  <button
                    onClick={() => handleMarkAsPaid(order?.id)}
                    disabled={payingId === order?.id}
                    className="w-full md:w-auto px-6 py-3 rounded-button bg-leaf-green text-white font-bold text-sm hover:bg-leaf-green/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-soft"
                  >
                    <CreditCard size={16} /> {payingId === order?.id ? "Processing..." : "Tandai Lunas"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Modal */}
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        userRole="Kasir" 
      />
    </div>
  );
}