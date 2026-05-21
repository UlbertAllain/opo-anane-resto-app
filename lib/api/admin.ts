// lib/api/admin.ts
import { createClient } from '@/lib/supabase/client'

// ================= MENU MANAGEMENT =================
export async function getAllMenus() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menus')
    .select('*, categories(name)') // Join untuk dapat nama kategori
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching all menus:', error?.message)
    return []
  }
  return data || []
}

export async function createMenu(menuData: any) {
  const supabase = createClient()
  const { error } = await supabase.from('menus').insert(menuData)
  
  if (error) {
    console.error('Error creating menu:', error?.message)
    throw new Error(error?.message || 'Gagal membuat menu')
  }
  return true
}

export async function updateMenu(id: string, menuData: any) {
  const supabase = createClient()
  const { error } = await supabase.from('menus').update(menuData).eq('id', id)
  
  if (error) {
    console.error('Error updating menu:', error?.message)
    throw new Error(error?.message || 'Gagal update menu')
  }
  return true
}

export async function deleteMenu(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('menus').delete().eq('id', id)
  
  if (error) {
    console.error('Error deleting menu:', error?.message)
    throw new Error(error?.message || 'Gagal menghapus menu')
  }
  return true
}

// ================= STAFF MANAGEMENT =================
export async function getStaffProfiles() {
  const supabase = createClient()
  // Ambil user yang bukan customer
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'customer')

  if (error) {
    console.error('Error fetching staff:', error?.message)
    return []
  }
  return data || []
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error?.message)
    throw new Error(error?.message || 'Gagal update role user')
  }
  return true
}
// Tambahkan ini di bagian bawah lib/api/admin.ts

// ================= STATISTICS =================
export async function getDailyStats() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  // Hitung pendapatan & jumlah pesanan hari ini (yang sudah bayar/selesai)
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('total_price')
    .gte('created_at', today)
    .lt('created_at', tomorrowStr)
    .in('status', ['completed', 'paid'])

  if (ordersError) {
    console.error('Error fetching daily stats:', ordersError?.message)
    return { revenue: 0, orders: 0 }
  }

  const revenue = ordersData.reduce((sum, order) => sum + (order?.total_price || 0), 0)
  const orders = ordersData.length

  return { revenue, orders }
}

export async function getAvailableMenuCount() {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('menus')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true)

  if (error) return 0
  return count || 0
}

// ================= CATEGORIES MANAGEMENT =================
export async function createCategory(name: string, image: string) {
  const supabase = createClient()
  const { error } = await supabase.from('categories').insert({ name, image })
  if (error) {
    console.error('Error creating category:', error?.message)
    throw new Error(error?.message || 'Gagal menambah kategori')
  }
  return true
}

export async function deleteCategory(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    console.error('Error deleting category:', error?.message)
    throw new Error(error?.message || 'Gagal menghapus kategori')
  }
  return true
}