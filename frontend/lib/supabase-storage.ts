import { supabase } from './supabase'

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && supabase)
}

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase n\'est pas configuré. Veuillez définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env.local')
  }
  
  try {
    // 1. Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // 2. Upload le fichier
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      throw error
    }

    // 3. Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw new Error('Erreur lors de l\'upload de l\'avatar')
  }
}

/**
 * Delete avatar from Supabase Storage
 */
export async function deleteAvatar(url: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase n\'est pas configuré. Veuillez définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env.local')
  }
  
  try {
    // Extraire le path depuis l'URL
    const path = url.split('/avatars/')[1]
    
    if (!path) {
      throw new Error('URL invalide')
    }

    const { error } = await supabase.storage
      .from('avatars')
      .remove([path])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting avatar:', error)
    throw new Error('Erreur lors de la suppression de l\'avatar')
  }
}

