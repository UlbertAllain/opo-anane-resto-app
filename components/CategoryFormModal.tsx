// components/CategoryFormModal.tsx
"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "@/lib/api/admin";
import { PlusCircle, Trash2, X, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

export default function CategoryFormModal({ isOpen, onClose, categories, onSuccess }: CategoryFormModalProps) {
  // 1. HOOKS DULU
  const [name, setName] = useState("");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 2. LOGIC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await createCategory(name, image);
      setName("");
      setImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500");
      onSuccess();
    } catch (error: any) {
      alert(error?.message || "Gagal menambah kategori");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini? Menu di dalamnya tidak akan terhapus, tapi akan kehilangan kategori.")) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      onSuccess();
    } catch (error: any) {
      alert(error?.message || "Gagal menghapus kategori");
    } finally {
      setDeletingId(null);
    }
  };

  // 3. CONDITIONAL RETURN
  if (!isOpen) return null;

  // 4. UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-soft overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-warm-brown flex items-center gap-2">
            <Tag size={20} /> Kelola Kategori
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-warm-brown"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Form Tambah Kategori */}
          <form onSubmit={handleSubmit} className="space-y-3 bg-warm-cream/50 p-4 rounded-card">
            <input
              type="text"
              placeholder="Nama Kategori Baru (cth: Minuman Dingin)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-soft-caramel/20 rounded-button px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 bg-white"
            />
            <input
              type="text"
              placeholder="URL Gambar (Opsional)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full border border-soft-caramel/20 rounded-button px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 bg-white"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-warm-brown text-white py-2 rounded-button font-semibold text-sm hover:bg-soft-caramel transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} /> {isSaving ? "Menyimpan..." : "Tambah Kategori"}
            </button>
          </form>

          {/* Daftar Kategori yang Ada */}
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-2">Kategori Saat Ini:</h3>
            <div className="space-y-2">
              {(categories || []).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-card">
                  <span className="text-sm font-medium text-text-primary">{cat?.name || "Tanpa Nama"}</span>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="text-error-red p-1 hover:bg-error-red/10 rounded-card transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-xs text-text-secondary text-center py-2">Belum ada kategori</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}