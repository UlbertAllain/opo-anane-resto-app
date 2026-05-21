// store/useCartStore.ts
import { create } from 'zustand'

export interface Addon {
  id: string
  name: string
  price: number
}

export interface CartItem {
  id: string
  name: string
  price: number // Ini adalah HARGA DASAR menu (tanpa addon)
  quantity: number
  image: string
  notes?: string
  spicyLevel?: string
  addons?: Addon[]
}

interface CartState {
  items: CartItem[]
  orderType: 'dine-in' | 'takeaway'
  tableNumber: number | null
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setOrderType: (type: 'dine-in' | 'takeaway') => void
  setTableNumber: (num: number | null) => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'dine-in',
  tableNumber: null,

  addItem: (item) => {
    set((state) => {
      // Cek item yang sama (ID, Level Pedas, Addon, dan Notes harus sama persis biar di-merge quantity-nya)
      const existingItemIndex = state.items.findIndex((i) => 
        i.id === item.id && 
        i.spicyLevel === item.spicyLevel && 
        JSON.stringify(i.addons) === JSON.stringify(item.addons) &&
        i.notes === item.notes
      )

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        }
        return { items: updatedItems }
      }
      return { items: [...state.items, item] }
    })
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
    } else {
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      }))
    }
  },

  clearCart: () => set({ items: [], tableNumber: null }),
  setOrderType: (type) => set({ orderType: type }),
  setTableNumber: (num) => set({ tableNumber: num }),

  // UNDEFINED SAFETY: Hitung harga dasar + harga addon
  getTotalPrice: () => {
    return get().items.reduce((total, item) => {
      const addonsPrice = (item?.addons || []).reduce((sum, addon) => sum + (addon?.price || 0), 0)
      const itemPrice = (item?.price || 0) + addonsPrice
      return total + itemPrice * (item?.quantity || 0)
    }, 0)
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + (item?.quantity || 0), 0)
  },
}))