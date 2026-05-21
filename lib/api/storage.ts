// lib/api/storage.ts
import { createClient } from '@/lib/supabase/client'

export async function uploadMenuImage(file: File) {
  const supabase = createClient()

  // Buat nama file unik berdasarkan timestamp + nama asli
  const fileExt = file.name.split('.').pop()
  const fileName = `menu-${Date.now()}.${fileExt}`

  // Upload ke bucket 'menu-images'
  const { error } = await supabase.storage
    .from('menu-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading image:', error?.message)
    throw new Error(error?.message || 'Gagal mengupload gambar')
  }

  // Ambil Public URL dari file yang baru diupload
  const { data } = supabase.storage
    .from('menu-images')
    .getPublicUrl(fileName)

  // UNDEFINED SAFETY: Pastikan publicUrl ada
  return data?.publicUrl || null
}