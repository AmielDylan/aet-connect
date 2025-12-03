'use client'

import { useState } from 'react'
import { Upload, Loader2, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadAvatar, deleteAvatar } from '@/lib/supabase-storage'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  userId: string
  onAvatarUpdate: (url: string | null) => void
}

export function AvatarUpload({ currentAvatarUrl, userId, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB')
      return
    }

    setIsUploading(true)

    try {
      // 1. Upload vers Supabase Storage
      const avatarUrl = await uploadAvatar(file, userId)

      // 2. Mettre à jour le profil
      await apiClient.updateProfile({ avatar_url: avatarUrl || undefined })

      // 3. Mettre à jour l'UI
      setPreview(avatarUrl)
      onAvatarUpdate(avatarUrl)
      toast.success('Avatar mis à jour avec succès')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Erreur lors de l\'upload de l\'avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!currentAvatarUrl) return

    setIsUploading(true)

    try {
      // 1. Supprimer de Supabase Storage
      await deleteAvatar(currentAvatarUrl)

      // 2. Mettre à jour le profil (on envoie undefined pour supprimer)
      await apiClient.updateProfile({ avatar_url: undefined })

      // 3. Mettre à jour l'UI
      setPreview(null)
      onAvatarUpdate(null)
      toast.success('Avatar supprimé avec succès')
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Erreur lors de la suppression de l\'avatar')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Avatar preview */}
      <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {preview ? (
          <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <User className="h-12 w-12 text-muted-foreground" />
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Upload buttons */}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {preview ? 'Changer' : 'Upload'}
        </Button>
        {preview && (
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={handleRemove}
          >
            <X className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        )}
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG ou GIF. Max 2MB.
        </p>
      </div>
    </div>
  )
}

