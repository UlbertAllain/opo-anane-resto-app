// lib/api/customer.ts
import { createClient } from '@/lib/supabase/client'

// Customer melacak pesanan berdasarkan KODE PESANAN
export async function getMyOrder(orderCode: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('order_code', orderCode) // Cari berdasarkan order_code
    .single() // Pastikan cuma ada 1 hasil

  if (error) {
    console.error('Error tracking order:', error?.message)
    return null
  }
  return data || null
}