// app/admin/staff/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { getStaffProfiles, updateUserRole } from "@/lib/api/admin";
import { ArrowLeft, Users, ShieldCheck, ChefHat, Headphones } from "lucide-react"; // Tambahkan icon role

export default function StaffManagementPage() {
  // 1. HOOKS DULU
  const { role, loading: authLoading } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getStaffProfiles();
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && role === "admin") {
      fetchUsers();
    }
  }, [authLoading, role]);

  // 2. CONDITIONAL RETURN
  if (authLoading || loading) {
    return <div className="flex h-screen items-center justify-center text-warm-brown font-bold bg-warm-cream">Loading Staff...</div>;
  }

  if (role !== "admin") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-warm-cream">
        <p className="text-error-red font-bold text-lg">Akses Ditolak</p>
        <Link href="/" className="text-warm-brown underline font-semibold">&larr; Kembali ke Menu</Link>
      </div>
    );
  }

  // 3. LOGIC
  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (error) {
      alert("Gagal mengubah role user");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <ShieldCheck size={18} className="text-warm-brown" />;
      case "chef": return <ChefHat size={18} className="text-blue-500" />;
      case "cashier": return <Headphones size={18} className="text-soft-caramel" />;
      default: return <Users size={18} />;
    }
  };

  // 4. UI
  return (
    <div className="min-h-screen bg-warm-cream p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-warm-brown flex items-center gap-2">
              <Users className="text-soft-caramel" /> Kelola Staff
            </h1>
            <p className="text-text-secondary">Ubah role dan akses akun restoran</p>
          </div>
          <Link href="/admin" className="bg-white px-4 py-2.5 rounded-button font-semibold text-sm text-warm-brown hover:bg-warm-cream transition-colors shadow-soft flex items-center gap-2 border border-soft-caramel/20">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-20 text-text-secondary flex flex-col items-center gap-2 bg-white rounded-card shadow-soft">
            <Users size={48} className="opacity-30" />
            <span>Belum ada akun staff yang terdaftar</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <div key={user?.id} className="bg-white p-5 rounded-card shadow-soft flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warm-cream flex items-center justify-center text-warm-brown">
                    {getRoleIcon(user?.role)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm">{user?.full_name || "Tanpa Nama"}</h3>
                    <p className="text-xs text-text-secondary truncate max-w-[150px]">{user?.id?.substring(0, 12)}...</p>
                  </div>
                </div>

                <select
                  value={user?.role || "customer"}
                  onChange={(e) => handleRoleChange(user?.id, e.target.value)}
                  disabled={updatingId === user?.id}
                  className="bg-warm-cream border border-soft-caramel/20 rounded-button px-3 py-2 text-sm font-medium text-warm-brown focus:outline-none focus:ring-2 focus:ring-soft-caramel/50 disabled:opacity-50"
                >
                  <option value="admin">Admin</option>
                  <option value="chef">Chef</option>
                  <option value="cashier">Cashier</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}