// store/useAuthStore.ts
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  role: string | null
  fullName: string | null // <--- TAMBAHKAN INI
  loading: boolean
  fetchUser: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  const supabase = createClient()

  return {
    user: null,
    role: null,
    fullName: null, // <--- TAMBAHKAN INI
    loading: true,
    
    fetchUser: async () => {
      set({ loading: true })
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name') // <--- TAMBAHKAN full_name
          .eq('id', user.id)
          .single()
        
        set({ 
          user, 
          role: profile?.role || 'customer', 
          fullName: profile?.full_name || 'Staff', // <--- SIMPAN NAMA DISINI (Fallback: Staff)
          loading: false 
        })
      } else {
        set({ user: null, role: null, fullName: null, loading: false }) // <--- RESET JUGA
      }
    },

    logout: async () => {
      await supabase.auth.signOut()
      set({ user: null, role: null, fullName: null }) // <--- RESET JUGA
    }
  }
})