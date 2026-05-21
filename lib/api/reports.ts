// lib/api/reports.ts
import { createClient } from '@/lib/supabase/client'

// Fungsi baru yang menerima range tanggal
export async function getOrdersByDateRange(startDate: string, endDate: string) {
  const supabase = createClient()
  
  // End date perlu ditambah 1 hari karena kita pakai lt (less than)
  // Misal endDate = 2023-10-25, kita mau ambik sampai 23:59:59, jadi kita filter < 2023-10-26
  const nextEndDate = new Date(endDate);
  nextEndDate.setDate(nextEndDate.getDate() + 1);
  const nextEndDateStr = nextEndDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .gte('created_at', startDate) // Greater than or equal to start
    .lt('created_at', nextEndDateStr) // Less than end + 1 day
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching order history:', error?.message)
    return []
  }
  return data || []
}

// Kita keep fungsi lama untuk quick view di dashboard
export async function getOrdersByDate(date: string) {
  return getOrdersByDateRange(date, date);
}