// components/MenuFormModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { uploadMenuImage } from "@/lib/api/storage";

interface Category {
  id: string;
  name: string;
}

interface MenuFormData {
  id?: string;
  name: string;
  price: number | string;
  description: string;
  image: string; // Ini akan menyimpan URL hasil upload
  category_id: string;
  is_available: boolean;
}

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuFormData) => Promise<void>;
  categories: Category[];
  initialData?: MenuFormData | null;
}

export default function MenuFormModal({ isOpen, onClose, onSubmit, categories, initialData }: MenuFormModalProps) {
  // 1. HOOKS DULU
  const [formData, setFormData] = useState<MenuFormData>({
    name: "",
    price: "",
    description: "",
    image: "",
    category_id: "",
    is_available: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewUrl(initialData.image || null);
      setSelectedFile(null);
    } else {
      setFormData({
        name: "",
        price: "",
        description: "",
        image: "",
        category_id: categories?.[0]?.id || "",
        is_available: true,
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [initialData, categories]);

  // 2. CONDITIONAL RETURN
  if (!isOpen) return null;

  // 3. LOGIC
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleToggleAvailable = () => {
    setFormData((prev) => ({ ...prev, is_available: !prev.is_available }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Buat preview di browser tanpa upload dulu
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalImageUrl = formData?.image || ""; // Ambil URL lama jika tidak ganti gambar

      // Jika admin memilih file baru, upload dulu ke Supabase Storage
      if (selectedFile) {
        const uploadedUrl = await uploadMenuImage(selectedFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl; // Ganti URL dengan URL hasil upload
        } else {
          throw new Error("Gagal mendapatkan URL gambar");
        }
      }

      // Kirim data final ke parent component
      await onSubmit({
        ...formData,
        image: finalImageUrl,
      });

      onClose();
    } catch (error: any) {
      alert(error?.message || "Gagal menyimpan menu");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          {initialData ? "Edit Menu" : "Tambah Menu Baru"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Menu</label>
            <input
              type="text"
              name="name"
              value={formData?.name || ""}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
            <input
              type="number"
              name="price"
              value={formData?.price || ""}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <select
              name="category_id"
              value={formData?.category_id || ""}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>Pilih Kategori</option>
              {(categories || []).map((cat) => (
                <option key={cat?.id} value={cat?.id}>{cat?.name || "Tanpa Nama"}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              name="description"
              value={formData?.description || ""}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* INI BAGIAN UPLOAD GAMBAR YANG BARU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Menu</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Pilih File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" // Sembunyikan input file asli
              />
              <span className="text-xs text-gray-500 truncate w-40">
                {selectedFile ? selectedFile.name : (initialData ? "Gunakan gambar lama" : "Belum ada file")}
              </span>
            </div>
            
            {/* Preview Gambar */}
            {previewUrl && (
              <div className="mt-2 relative w-24 h-24 rounded-md overflow-hidden bg-gray-100 border">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_available_modal"
              checked={formData?.is_available || false}
              onChange={handleToggleAvailable}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_available_modal" className="text-sm font-medium text-gray-700">Tersedia (Bisa Dipesan)</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}