'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { PasswordStrength } from '@/components/profile/password-strength'
import { 
  Loader2, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Lock,
} from 'lucide-react'
import type { UpdateProfileRequest } from '@/types'
import type { ChangePasswordData, PasswordValidation } from '@/types/profile'

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<UpdateProfileRequest>({})
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  // Récupérer le profil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => apiClient.getUserProfile(),
  })

  // Mutation mise à jour profil
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => apiClient.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      setIsEditing(false)
    },
  })

  // Mutation changement mot de passe
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) =>
      apiClient.changePassword(data.old_password, data.new_password),
    onSuccess: () => {
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      })
      setPasswordValidation({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      })
    },
  })

  // Valider le mot de passe en temps réel
  const validatePassword = (password: string) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    })
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileData)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier que les mots de passe correspondent
    if (passwordData.new_password !== passwordData.confirm_password) {
      return
    }

    // Vérifier la validation
    const isValid = Object.values(passwordValidation).every((v) => v)
    if (!isValid) {
      return
    }

    changePasswordMutation.mutate(passwordData)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!profile || !user) {
    return <div>Erreur de chargement</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et votre sécurité
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Mettez à jour vos informations de profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div>
              <Label>Photo de profil</Label>
              <div className="mt-2">
                <AvatarUpload
                  currentAvatarUrl={profile.avatar_url}
                  userId={user.id}
                  onAvatarUpdate={() => {
                    queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
                  }}
                />
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    defaultValue={profile.first_name}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData({ ...profileData, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    defaultValue={profile.last_name}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData({ ...profileData, last_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={profile.email}
                  disabled={true}
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  L&apos;email ne peut pas être modifié
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue={profile.phone || ''}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville actuelle</Label>
                  <Input
                    id="city"
                    defaultValue={profile.current_city || ''}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData({ ...profileData, current_city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    defaultValue={profile.current_country || ''}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData({ ...profileData, current_country: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  defaultValue={profile.bio || ''}
                  disabled={!isEditing}
                  rows={4}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                />
              </div>

              {/* Success message */}
              {updateProfileMutation.isSuccess && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Profil mis à jour avec succès</AlertDescription>
                </Alert>
              )}

              {/* Error message */}
              {updateProfileMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {updateProfileMutation.error instanceof Error
                      ? updateProfileMutation.error.message
                      : 'Erreur lors de la mise à jour'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setProfileData({})
                      }}
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Modifier
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Changement mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
            <CardDescription>
              Mettez à jour votre mot de passe pour sécuriser votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old_password">Ancien mot de passe</Label>
                <Input
                  id="old_password"
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, old_password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, new_password: e.target.value })
                    validatePassword(e.target.value)
                  }}
                  required
                />
                <PasswordStrength
                  password={passwordData.new_password}
                  validation={passwordValidation}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm_password: e.target.value })
                  }
                  required
                />
                {passwordData.confirm_password &&
                  passwordData.new_password !== passwordData.confirm_password && (
                    <p className="text-sm text-destructive">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
              </div>

              {/* Success message */}
              {changePasswordMutation.isSuccess && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Mot de passe changé avec succès</AlertDescription>
                </Alert>
              )}

              {/* Error message */}
              {changePasswordMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {changePasswordMutation.error instanceof Error
                      ? changePasswordMutation.error.message
                      : 'Erreur lors du changement de mot de passe'}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  changePasswordMutation.isPending ||
                  !Object.values(passwordValidation).every((v) => v) ||
                  passwordData.new_password !== passwordData.confirm_password ||
                  !passwordData.old_password
                }
              >
                {changePasswordMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Lock className="mr-2 h-4 w-4" />
                Changer le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
