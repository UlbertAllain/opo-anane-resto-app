// lib/api/cashier.ts
import { createClient } from '@/lib/supabase/client'

// Kasir butuh melihat pesanan yang statusnya 'completed' (sudah selesai masak, siap bayar)
// Atau yang sudah 'paid' (sudah dibayar hari ini)
export async function getCashierOrders() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .in('status', ['completed', 'paid']) // Kitchen menandai completed, Kasir menandai paid
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching cashier orders:', error?.message)
    return []
  }
  return data || []
}

export async function markOrderAsPaid(orderId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId)

  if (error) {
    console.error('Error marking order as paid:', error?.message)
    throw new Error(error?.message || 'Gagal update status pembayaran')
  }
  
  return true
}