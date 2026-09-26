import { supabase } from './supabaseClient'

/**
 * Sube un archivo a un bucket de Supabase Storage y devuelve la URL pública.
 * Los buckets ("product-images" y "store-assets") deben crearse una sola vez
 * desde el panel de Supabase (Storage -> New bucket), marcados como públicos.
 */
export async function uploadFile(bucket: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
