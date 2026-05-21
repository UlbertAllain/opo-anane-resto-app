// components/ExportModal.tsx
"use client";

import { useState } from "react";
import { exportOrdersToExcel } from "@/lib/api/export";
import { getOrdersByDateRange } from "@/lib/api/reports";
import { Download, X } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string; // Untuk nama file
}

export default function ExportModal({ isOpen, onClose, userRole }: ExportModalProps) {
  // 1. HOOKS DULU
  const [filterType, setFilterType] = useState<"daily" | "weekly" | "monthly" | "custom">("daily");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isExporting, setIsExporting] = useState(false);

  // 2. LOGIC
  const handleFilterChange = (type: "daily" | "weekly" | "monthly" | "custom") => {
    setFilterType(type);
    const today = new Date().toISOString().split('T')[0];
    
    if (type === "daily") {
      setStartDate(today);
      setEndDate(today);
    } else if (type === "weekly") {
      const date = new Date();
      const firstDay = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0]; // Awal minggu (Minggu)
      setStartDate(firstDay);
      setEndDate(today);
    } else if (type === "monthly") {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(today);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await getOrdersByDateRange(startDate, endDate);
      if (data.length === 0) {
        alert("Tidak ada data pesanan di rentang tanggal ini.");
        setIsExporting(false);
        return;
      }
      const fileName = `Laporan-${userRole}-${startDate}-sd-${endDate}`;
      exportOrdersToExcel(data, fileName);
      onClose();
    } catch (error) {
      alert("Gagal mengambil data laporan.");
    } finally {
      setIsExporting(false);
    }
  };

  // 3. CONDITIONAL RETURN
  if (!isOpen) return null;

  // 4. UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-soft overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-warm-brown flex items-center gap-2">
            <Download size={20} /> Export Laporan
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-warm-brown"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Filter Type Selection */}
          <div className="flex gap-2">
            <button onClick={() => handleFilterChange("daily")} className={`flex-1 py-2 text-xs font-semibold rounded-pill border-2 transition-colors ${filterType === "daily" ? "bg-warm-brown text-white border-warm-brown" : "border-soft-caramel/20 text-text-secondary"}`}>Harian</button>
            <button onClick={() => handleFilterChange("weekly")} className={`flex-1 py-2 text-xs font-semibold rounded-pill border-2 transition-colors ${filterType === "weekly" ? "bg-warm-brown text-white border-warm-brown" : "border-soft-caramel/20 text-text-secondary"}`}>7 Hari</button>
            <button onClick={() => handleFilterChange("monthly")} className={`flex-1 py-2 text-xs font-semibold rounded-pill border-2 transition-colors ${filterType === "monthly" ? "bg-warm-brown text-white border-warm-brown" : "border-soft-caramel/20 text-text-secondary"}`}>Bulanan</button>
            <button onClick={() => handleFilterChange("custom")} className={`flex-1 py-2 text-xs font-semibold rounded-pill border-2 transition-colors ${filterType === "custom" ? "bg-warm-brown text-white border-warm-brown" : "border-soft-caramel/20 text-text-secondary"}`}>Kustom</button>
          </div>

          {/* Date Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Tanggal Mulai</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full bg-warm-cream/50 border border-soft-caramel/20 rounded-button px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soft-caramel/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Tanggal Akhir</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                disabled={filterType !== "custom"} // Hanya bisa diedit jika Kustom
                className="w-full bg-warm-cream/50 border border-soft-caramel/20 rounded-button px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="p-5 bg-warm-cream/50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-button text-sm font-semibold text-text-secondary hover:bg-warm-cream transition-colors">
            Batal
          </button>
          <button 
            onClick={handleExport} 
            disabled={isExporting || !startDate || !endDate} 
            className="bg-leaf-green text-white px-5 py-2.5 rounded-button font-semibold text-sm hover:bg-leaf-green/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Download size={16} /> {isExporting ? "Memproses..." : "Download Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}