// lib/api/menu.ts
import { createClient } from '@/lib/supabase/client'

export async function getCategories() {
  const supabase = createClient() // Pindahkan ke dalam fungsi
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error?.message)
    return []
  }
  return data || []
}

export async function getPopularMenus() {
  const supabase = createClient() // Pindahkan ke dalam fungsi
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('is_available', true)
    .limit(10)

  if (error) {
    console.error('Error fetching popular menus:', error?.message)
    return []
  }
  return data || []
}

export async function getMenusByCategory(categoryId: string) {
  const supabase = createClient() // Pindahkan ke dalam fungsi
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_available', true)

  if (error) {
    console.error('Error fetching menus by category:', error?.message)
    return []
  }
  return data || []
}

export async function getMenuById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menus')
    .select(`
      *,
      menu_addons (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching menu detail:', error?.message)
    return null
  }
  return data || null
}