// lib/api/kitchen.ts
import { createClient } from '@/lib/supabase/client'

export async function getKitchenOrders() {
  const supabase = createClient()
  
  // Kitchen hanya butuh melihat order yang statusnya pending atau preparing
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .in('status', ['pending', 'preparing'])
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching kitchen orders:', error?.message)
    return []
  }
  return data || []
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error?.message)
    throw new Error(error?.message || 'Gagal update status order')
  }
  
  return true
}