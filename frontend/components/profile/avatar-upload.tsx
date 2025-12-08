'use client'

import { useState } from 'react'
import { Upload, Loader2, User, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { uploadAvatar, deleteAvatar } from '@/lib/supabase-storage'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId?: string
  onAvatarUpdate?: (url: string | null) => void
}

export function AvatarUpload({ onAvatarUpdate }: AvatarUploadProps) {
  const { user, setUser } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB')
      return
    }

    setIsUploading(true)
    try {
      // Supprimer l'ancien si existe
      if (user.avatar_url) {
        try {
          await deleteAvatar(user.id, user.avatar_url)
        } catch (err) {
          console.warn('Could not delete old avatar:', err)
        }
      }

      // Upload nouveau
      const avatarUrl = await uploadAvatar(user.id, file)

      // Mettre à jour dans la base via API
      await apiClient.updateProfile({ avatar_url: avatarUrl })

      // Mettre à jour le store directement (pas de rechargement)
      if (user) {
        setUser({ ...user, avatar_url: avatarUrl })
      }
      onAvatarUpdate?.(avatarUrl)

      toast.success('Photo mise à jour')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Impossible de mettre à jour la photo')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async () => {
    if (!user?.avatar_url || !user?.id) return

    setIsDeleting(true)
    try {
      // Supprimer dans Storage
      await deleteAvatar(user.id, user.avatar_url)

      // Mettre à jour dans la base
      await apiClient.updateProfile({ avatar_url: undefined })

      // Mettre à jour le store directement
      if (user) {
        setUser({ ...user, avatar_url: null })
      }
      onAvatarUpdate?.(null)

      toast.success('Avatar supprimé')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Impossible de supprimer l\'avatar')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={user?.avatar_url || ''} alt="Avatar" />
        <AvatarFallback>
          <User className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <label htmlFor="avatar-upload">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading || isDeleting}
            asChild
          >
            <span className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upload...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Changer
                </>
              )}
            </span>
          </Button>
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading || isDeleting}
        />

        {user?.avatar_url && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isUploading || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </>
            )}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG ou GIF. Max 2MB.
        </p>
      </div>
    </div>
  )
}

