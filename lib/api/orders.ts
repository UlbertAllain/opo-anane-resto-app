// lib/api/orders.ts
import { createClient } from '@/lib/supabase/client'
import { CartItem } from '@/store/useCartStore'

interface CreateOrderParams {
  items: CartItem[]
  orderType: 'dine-in' | 'takeaway'
  tableNumber: number | null
  customerName: string
  totalPrice: number
}

// Helper untuk generate kode pesanan unik (4 karakter alphanumeric)
function generateOrderCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createOrder({ items, orderType, tableNumber, customerName, totalPrice }: CreateOrderParams) {
  const supabase = createClient()

  // Generate order code, pastikan unik (loop jika sempat nabrak)
  let orderCode = generateOrderCode()
  let isCodeUnique = false
  
  while (!isCodeUnique) {
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('order_code', orderCode)
      .single()
    
    if (!existing) {
      isCodeUnique = true
    } else {
      orderCode = generateOrderCode() // Coba lagi jika duplikat
    }
  }

  // 1. Insert ke tabel orders (Dengan order_code)
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      order_code: orderCode, // Simpan kode pesanan
      order_type: orderType,
      table_number: tableNumber,
      total_price: totalPrice,
      status: 'pending',
      user_id: null
    })
    .select('id')
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError?.message)
    throw new Error(orderError?.message || 'Gagal membuat pesanan')
  }

  const orderId = orderData?.id

  if (!orderId) {
    throw new Error('Order ID tidak ditemukan setelah insert')
  }

  // 2. Mapping cart items
    // 2. Mapping cart items (DITAMBAH: notes, spicyLevel, addons)
  const orderItems = items.map((item) => {
    const addonsPrice = (item?.addons || []).reduce((sum, addon) => sum + (addon?.price || 0), 0)
    
    return {
      order_id: orderId,
      menu_name: item?.name || 'Menu',
      quantity: item?.quantity || 1,
      price: (item?.price || 0) + addonsPrice, // Simpan total harga per item (dasar + addon)
      notes: item?.notes || null, // Tambahkan notes
      selected_spicy_level: item?.spicyLevel || 'Sedang', // Tambahkan level pedas
      selected_addons: item?.addons || [], // Simpan array addon sebagai JSONB
    }
  })

  // 3. Insert ke tabel order_items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Error creating order items:', itemsError?.message)
    throw new Error(itemsError?.message || 'Gagal membuat item pesanan')
  }

  // Kembalikan orderCode agar Customer bisa lacak
  return orderCode 
}