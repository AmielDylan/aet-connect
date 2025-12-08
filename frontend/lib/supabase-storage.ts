import { supabase } from './supabase'

/**
 * Upload avatar dans Storage
 * Path: {userId}/{timestamp}.{ext}
 * Best practice: Upsert true pour remplacer
 */
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/${timestamp}.${fileExt}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Remplace si existe
    })

  if (error) throw error

  // Bucket PUBLIC → utiliser getPublicUrl
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Delete avatar depuis Storage
 * IMPORTANT: Toujours via API, jamais via SQL (doc Supabase)
 */
export const deleteAvatar = async (_userId: string, avatarUrl: string): Promise<void> => {
  // Extraire le path depuis l'URL publique
  // Ex: https://xxx.supabase.co/storage/v1/object/public/avatars/user-id/file.jpg
  //     → user-id/file.jpg
  
  const match = avatarUrl.match(/\/avatars\/(.+)$/)
  if (!match?.[1]) {
    throw new Error('Invalid avatar URL format')
  }

  const filePath = match[1]

  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath])

  if (error) throw error
}
