'use client'

import { useState, useRef, useEffect } from 'react'
import { FilePond as FilePondBase, registerPlugin } from 'react-filepond'

// Cast pour éviter les erreurs de types sur les props de plugins non déclarés
const FilePond = FilePondBase as any
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadAvatar, deleteAvatar } from '@/lib/supabase-storage'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'

// Enregistrer les plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId?: string
  onAvatarUpdate?: (url: string | null) => void
}

export function AvatarUpload({ onAvatarUpdate }: AvatarUploadProps) {
  const { user, setUser } = useAuthStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const pondRef = useRef<FilePondBase>(null)
  const lastAvatarUrlRef = useRef<string | null | undefined>(undefined)
  const isValidatingRef = useRef(false) // Flag pour éviter les validations multiples simultanées
  const invalidUrlsRef = useRef<Set<string>>(new Set()) // Set pour tracker les URLs invalides

  // Normaliser avatar_url pour éviter les problèmes de dépendances
  const avatarUrl = user?.avatar_url ?? null

  // Toujours initialiser files vide pour afficher l'interface de chargement
  const [files, setFiles] = useState<any[]>([])

  // Vérifier si une URL d'image est valide avant de l'ajouter à FilePond
  const validateImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Extraire l'URL de base sans les paramètres de cache
      const baseUrl = url.split('?')[0]
      
      // Si l'URL de base est déjà marquée comme invalide, retourner false immédiatement
      if (invalidUrlsRef.current.has(baseUrl)) {
        console.log('[DEBUG] URL already marked as invalid', {baseUrl})
        resolve(false)
        return
      }

      const img = new Image()
      let resolved = false

      img.onload = () => {
        if (!resolved) {
          resolved = true
          console.log('[DEBUG] Image URL is valid', {url})
          resolve(true)
        }
      }

      img.onerror = () => {
        if (!resolved) {
          resolved = true
          console.log('[DEBUG] Image URL validation failed', {url, baseUrl})
          // Marquer l'URL de base comme invalide
          invalidUrlsRef.current.add(baseUrl)
          resolve(false)
        }
      }

      // Timeout après 2 secondes
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          console.log('[DEBUG] Image URL validation timeout', {url, baseUrl})
          invalidUrlsRef.current.add(baseUrl)
          resolve(false)
        }
      }, 2000)

      // Utiliser l'URL avec cache buster pour éviter le cache du navigateur
      img.src = url
    })
  }

  // Synchroniser FilePond avec l'avatar utilisateur
  useEffect(() => {
    const currentAvatarUrl = avatarUrl
    const isFirstInit = lastAvatarUrlRef.current === undefined
    
    // Ne mettre à jour que si l'avatar a vraiment changé
    if (!isFirstInit && lastAvatarUrlRef.current === currentAvatarUrl) return

    lastAvatarUrlRef.current = currentAvatarUrl

    // Mettre à jour les fichiers FilePond selon l'état de l'avatar
    if (currentAvatarUrl) {
      // Extraire l'URL de base sans les paramètres de cache pour la vérification
      const baseUrl = currentAvatarUrl.split('?')[0]
      
      // Vérifier si cette URL de base a déjà été marquée comme invalide
      if (invalidUrlsRef.current.has(baseUrl)) {
        console.log('[DEBUG] URL already invalid, skipping', {baseUrl, currentAvatarUrl})
        setFiles([])
        // Mettre à jour le store pour supprimer l'avatar invalide
        const currentUser = useAuthStore.getState().user
        if (currentUser && currentUser.avatar_url === currentAvatarUrl) {
          setUser({ ...currentUser, avatar_url: null })
          lastAvatarUrlRef.current = null
        }
        return
      }

      // Éviter les validations multiples simultanées
      if (isValidatingRef.current) {
        return
      }

      isValidatingRef.current = true

      // Avatar existe : vérifier d'abord si l'URL est valide AVANT de l'ajouter à FilePond
      // Ajouter un timestamp pour éviter le cache du navigateur
      const urlWithCacheBuster = baseUrl + (baseUrl.includes('?') ? '&' : '?') + '_t=' + Date.now()
      
      validateImageUrl(urlWithCacheBuster).then((isValid) => {
        isValidatingRef.current = false

        // Vérifier si l'URL a changé pendant la validation
        const currentUser = useAuthStore.getState().user
        const currentBaseUrl = currentUser?.avatar_url?.split('?')[0]
        if (currentBaseUrl !== baseUrl) {
          console.log('[DEBUG] Avatar URL changed during validation, skipping', {baseUrl, currentBaseUrl})
          return
        }

        if (!isValid) {
          console.log('[DEBUG] Invalid avatar URL, clearing FilePond', {baseUrl, currentAvatarUrl})
          // Marquer cette URL de base comme invalide
          invalidUrlsRef.current.add(baseUrl)
          
          // Vider FilePond
          if (pondRef.current) {
            try {
              pondRef.current.removeFiles()
            } catch (e) {
              // Ignorer les erreurs
            }
          }
          setFiles([])
          
          // Mettre à jour le store pour supprimer l'avatar invalide
          if (currentUser && currentUser.avatar_url) {
            setUser({ ...currentUser, avatar_url: null })
            lastAvatarUrlRef.current = null
          }
        } else {
          // URL valide : charger l'image existante avec cache buster
          // Vérifier une dernière fois que l'URL n'est pas marquée comme invalide
          if (invalidUrlsRef.current.has(baseUrl)) {
            console.log('[DEBUG] URL marked as invalid during validation, skipping', {baseUrl})
            setFiles([])
            // Mettre à jour le store pour supprimer l'avatar invalide
            const currentUser = useAuthStore.getState().user
            if (currentUser && currentUser.avatar_url) {
              const currentBaseUrl = currentUser.avatar_url.split('?')[0]
              if (currentBaseUrl === baseUrl) {
                setUser({ ...currentUser, avatar_url: null })
                lastAvatarUrlRef.current = null
              }
            }
            return
          }
          
          console.log('[DEBUG] Adding valid image to FilePond', {baseUrl})
          invalidUrlsRef.current.delete(baseUrl)
          setFiles([
            {
              source: urlWithCacheBuster,
              options: {
                type: 'local',
              },
            },
          ])
        }
      }).catch(() => {
        isValidatingRef.current = false
        // En cas d'erreur de validation, ne pas charger l'image
        console.log('[DEBUG] Validation error, not loading image', {baseUrl})
        invalidUrlsRef.current.add(baseUrl)
        setFiles([])
      })
    } else {
      // Pas d'avatar : FilePond doit être vide pour afficher l'interface de chargement
      setFiles([])
    }
  }, [avatarUrl])

  const handleFileProcess = async (
    _fieldName: string,
    file: File,
    _metadata: any,
    load: (value: string) => void,
    error: (message: string) => void,
    progress: (isLengthComputable: boolean, loaded: number, total: number) => void,
    _abort: () => void
  ) => {
    if (!user?.id) {
      error('Utilisateur non connecté')
      return
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      error('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      error('L\'image ne doit pas dépasser 2MB')
      return
    }

    try {
      // Simuler la progression
      progress(true, 0, file.size)
      
      // Supprimer l'ancien avatar si existe
      if (user.avatar_url) {
        try {
          await deleteAvatar(user.id, user.avatar_url)
        } catch (err) {
          console.warn('Could not delete old avatar:', err)
        }
      }

      progress(true, file.size / 2, file.size)

      // Upload nouveau avatar
      const avatarUrl = await uploadAvatar(user.id, file)

      progress(true, file.size, file.size)

      // Mettre à jour dans la base via API
      await apiClient.updateProfile({ avatar_url: avatarUrl })

      // Nettoyer le Set des URLs invalides pour cette nouvelle URL
      invalidUrlsRef.current.delete(avatarUrl)

      // Appeler le callback pour recharger l'utilisateur depuis l'API
      if (onAvatarUpdate) {
        await onAvatarUpdate(avatarUrl)
      }
      
      // Mettre à jour lastAvatarUrlRef après le callback
      lastAvatarUrlRef.current = avatarUrl
      
      toast.success('Photo mise à jour')
      
      // Indiquer à FilePond que le traitement est terminé avec l'URL comme identifiant
      load(avatarUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      error(err.message || 'Impossible de mettre à jour la photo')
    }
  }

  // Fonction de suppression commune
  const performDelete = async () => {
    const currentUser = useAuthStore.getState().user
    if (!currentUser?.avatar_url || !currentUser?.id) {
      throw new Error('Utilisateur non connecté')
    }

    const avatarUrlToDelete = currentUser.avatar_url
    const baseUrl = avatarUrlToDelete.split('?')[0]

    // Éviter les appels multiples simultanés
    if (isDeleting) {
      return
    }

    setIsDeleting(true)
    
    try {
      // Marquer cette URL comme invalide IMMÉDIATEMENT pour éviter qu'elle soit rechargée
      invalidUrlsRef.current.add(baseUrl)
      
      // Vider FilePond AVANT de mettre à jour le store
      setFiles([])
      if (pondRef.current) {
        try {
          pondRef.current.removeFiles()
        } catch (e) {
          console.warn('Could not remove files from FilePond:', e)
        }
      }
      
      // Supprimer dans Storage
      await deleteAvatar(currentUser.id, avatarUrlToDelete)

      // Mettre à jour dans la base
      await apiClient.updateProfile({ avatar_url: undefined })
      
      // Mettre à jour le store immédiatement pour que la navbar se mette à jour
      const updatedUser = { ...currentUser, avatar_url: null }
      setUser(updatedUser)
      lastAvatarUrlRef.current = null
      
      // Appeler le callback pour recharger l'utilisateur depuis l'API
      if (onAvatarUpdate) {
        await onAvatarUpdate(null)
      }
      
      toast.success('Avatar supprimé')
    } catch (err: any) {
      console.error('Delete error:', err)
      throw err
    } finally {
      setIsDeleting(false)
    }
  }

  // Fonction appelée quand l'utilisateur supprime via le bouton X de FilePond
  const handleFileRemoveFromPond = async (
    _uniqueFileId: string,
    load: () => void,
    error: (message: string) => void
  ) => {
    // Éviter les appels multiples
    if (isDeleting) {
      load()
      return
    }

    try {
      await performDelete()
      // FilePond sera vidé par performDelete, on appelle load() pour confirmer
      load()
    } catch (err: any) {
      error(err.message || 'Impossible de supprimer l\'avatar')
    }
  }

  // Fonction appelée quand l'utilisateur clique sur le bouton externe "Supprimer"
  const handleFileRemove = async () => {
    const currentUser = useAuthStore.getState().user
    if (!currentUser?.avatar_url || !currentUser?.id || isDeleting) return

    try {
      await performDelete()
      // FilePond sera vidé par performDelete
    } catch (error: any) {
      toast.error(error.message || 'Impossible de supprimer l\'avatar')
    }
  }

  // Gérer l'ajout d'un nouveau fichier pour remplacer l'ancien
  const handleAddFile = (error: any, file: any) => {
    if (error) {
      console.error('Error adding file:', error)
      return
    }
    
    // Si c'est un fichier local (URL), vérifier si l'URL est invalide AVANT que FilePond ne la charge
    if (file && file.source && file.options?.type === 'local') {
      const baseUrl = file.source.split('?')[0]
      if (invalidUrlsRef.current.has(baseUrl)) {
        console.log('[DEBUG] Preventing add of invalid URL file', {baseUrl, fileSource: file.source})
        // Empêcher FilePond d'ajouter ce fichier IMMÉDIATEMENT
        setTimeout(() => {
          if (pondRef.current) {
            try {
              pondRef.current.removeFile(file)
            } catch (e) {
              // Ignorer les erreurs
            }
          }
          setFiles([])
        }, 10)
        return
      }
    }
    
    // Si un fichier local existe déjà et qu'on ajoute un nouveau fichier réel
    if (file.file instanceof File && !isDeleting) {
      // Supprimer immédiatement tous les fichiers locaux existants pour permettre le remplacement
      setTimeout(() => {
        if (pondRef.current) {
          const currentFiles = pondRef.current.getFiles()
          currentFiles.forEach((existingFile: any) => {
            // Supprimer seulement les fichiers locaux, pas le nouveau fichier ajouté
            if (existingFile.options?.type === 'local' && existingFile.id !== file.id) {
              try {
                pondRef.current?.removeFile(existingFile)
              } catch (e) {
                console.warn('Could not remove existing file:', e)
              }
            }
          })
        }
      }, 50)
    }
  }

  // Gérer la mise à jour des fichiers
  const handleUpdateFiles = (fileItems: any[]) => {
    setFiles(fileItems)
  }

  // Gérer la suppression d'un fichier
  const handleRemoveFile = (error: any, _file: any) => {
    // Ne logger que les vraies erreurs (avec un message)
    if (error && error.message) {
      console.error('Error removing file:', error)
      return
    }
  }

  // Gérer les erreurs de chargement d'image
  const handleFileLoadError = (file: any, error: any) => {
    const fileSource = file?.source || file?.filename || ''
    const baseUrl = fileSource.split('?')[0]
    
    // Éviter les appels multiples pour la même URL
    if (invalidUrlsRef.current.has(baseUrl)) {
      console.log('[DEBUG] Error already handled for this URL, skipping', {baseUrl})
      return
    }
    
    console.log('[DEBUG] FilePond file load error', {fileSource, baseUrl, error})
    
    // Marquer cette URL de base comme invalide IMMÉDIATEMENT
    invalidUrlsRef.current.add(baseUrl)
    
    // Si l'image ne peut pas être chargée (404, 400, etc.), vider FilePond
    if (pondRef.current) {
      try {
        pondRef.current.removeFiles()
        setFiles([])
        // Mettre à jour le store pour supprimer l'avatar invalide
        const currentUser = useAuthStore.getState().user
        if (currentUser && currentUser.avatar_url) {
          const currentBaseUrl = currentUser.avatar_url.split('?')[0]
          if (currentBaseUrl === baseUrl) {
            setUser({ ...currentUser, avatar_url: null })
            lastAvatarUrlRef.current = null
          }
        }
      } catch (e) {
        console.error('[DEBUG] Error clearing files after load error', e)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="max-w-[200px] mx-auto">
        <style dangerouslySetInnerHTML={{
          __html: `
            .filepond--root[data-style-panel-layout~='circle'] .filepond--panel-root {
              background-color: #f3f4f6 !important;
              border-radius: 50% !important;
              min-height: 200px !important;
              min-width: 200px !important;
            }
            .filepond--root[data-style-panel-layout~='circle'] .filepond--drop-label {
              border-radius: 50% !important;
              color: #6b7280 !important;
            }
            .filepond--root[data-style-panel-layout~='circle'] .filepond--label-action {
              text-decoration: underline !important;
              cursor: pointer !important;
              color: #3b82f6 !important;
            }
            .filepond--root[data-style-panel-layout~='circle'] .filepond--drop-label label {
              cursor: pointer !important;
            }
          `
        }} />
        <FilePond
          ref={pondRef}
          files={files}
          onupdatefiles={handleUpdateFiles}
          onaddfile={handleAddFile}
          onremovefile={handleRemoveFile}
          onerror={(error: any, file: any) => {
            // Si erreur de chargement d'image locale (400, 404, etc.), gérer l'erreur
            if (file && (file as any).options && (file as any).options.type === 'local') {
              handleFileLoadError(file, error)
            }
          }}
          allowMultiple={false}
          maxFiles={2}
          maxFileSize="2MB"
          acceptedFileTypes={['image/*']}
          instantUpload={true}
          allowRevert={false}
          allowDrop={true}
          server={{
            process: handleFileProcess as any,
            remove: handleFileRemoveFromPond as any,
          }}
          name="avatar"
          labelIdle='Glissez-déposez votre photo ou <span class="filepond--label-action">parcourir</span>'
          labelFileProcessing="Upload en cours..."
          labelFileProcessingComplete="Upload terminé"
          labelFileProcessingError="Erreur lors de l'upload"
          labelFileSizeNotAllowed="Fichier trop volumineux"
          labelFileTypeNotAllowed="Type de fichier non autorisé"
          imagePreviewHeight={120}
          stylePanelLayout="compact circle"
          styleLoadIndicatorPosition="center bottom"
          styleProgressIndicatorPosition="center bottom"
          styleButtonRemoveItemPosition="center bottom"
          styleButtonProcessItemPosition="center bottom"
        />
      </div>

      {user?.avatar_url && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFileRemove}
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Suppression...' : 'Supprimer l\'avatar'}
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        JPG, PNG ou GIF. Max 2MB. L'image sera recadrée en carré.
      </p>
    </div>
  )
}
