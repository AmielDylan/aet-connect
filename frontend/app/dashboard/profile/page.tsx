'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordStrength } from '@/components/profile/password-strength'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  Lock,
  Trash2,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { COUNTRY_FLAGS } from '@/lib/countries'
import type { UpdateProfileRequest, UpdatePrivacyRequest } from '@/types'
import type { ChangePasswordData, PasswordValidation } from '@/types/profile'

export default function ProfilePage() {
  const { user } = useAuth()
  const loadUser = useAuthStore((state) => state.loadUser)
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    first_name: '',
    last_name: '',
    phone: '',
    current_city: '',
    current_country: '',
    linkedin_url: '',
    bio: '',
  })
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
  const [privacySettings, setPrivacySettings] = useState({
    show_email: true,
    show_phone: false,
    show_current_location: true,
    show_bio: true,
    show_linkedin: true,
    show_entry_year: true,
  })

  const { toast } = useToast()
  const { logout } = useAuth()
  const [deletionReason, setDeletionReason] = useState('')
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false)

  // Récupérer le profil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => apiClient.getUserProfile(),
  })

  // Récupérer la liste des pays
  const { data: countriesData } = useQuery({
    queryKey: ['filter-countries'],
    queryFn: () => apiClient.getFilterCountries(),
  })
  const countries = countriesData?.countries || []

  // Récupérer les privacy settings
  const { data: privacyData } = useQuery({
    queryKey: ['user', 'privacy'],
    queryFn: () => apiClient.getPrivacySettings(),
    enabled: !!user,
  })

  // Mettre à jour privacySettings quand privacyData change
  useEffect(() => {
    if (privacyData) {
      setPrivacySettings({
        show_email: privacyData.show_email ?? true,
        show_phone: privacyData.show_phone ?? false,
        show_current_location: privacyData.show_current_location ?? true,
        show_bio: privacyData.show_bio ?? true,
        show_linkedin: privacyData.show_linkedin ?? true,
        show_entry_year: privacyData.show_entry_year ?? true,
      })
    }
  }, [privacyData])

  // Mettre à jour formData quand profile ou user change
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        current_city: profile.current_city || '',
        current_country: profile.current_country || '',
        linkedin_url: profile.linkedin_url || '',
        bio: profile.bio || '',
      })
    } else if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        current_city: user.current_city || '',
        current_country: user.current_country || '',
        linkedin_url: user.linkedin_url || '',
        bio: user.bio || '',
      })
    }
  }, [profile, user])

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

  // Mutation demande de suppression de compte
  const requestDeletionMutation = useMutation({
    mutationFn: (reason: string) => apiClient.requestAccountDeletion(reason || undefined),
    onSuccess: async () => {
      setDeletionDialogOpen(false)
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de suppression a été transmise aux administrateurs. Vous allez être déconnecté.',
      })
      // Attendre un court délai pour que le toast soit visible, puis déconnecter
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await logout()
      window.location.href = '/login'
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer la demande de suppression',
        variant: 'destructive',
      })
    },
  })

  // Mutation mise à jour privacy
  const updatePrivacyMutation = useMutation({
    mutationFn: (data: UpdatePrivacyRequest) => apiClient.updatePrivacySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'privacy'] })
      toast({
        title: 'Préférences mises à jour',
        description: 'Vos paramètres de confidentialité ont été enregistrés',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour les préférences',
        variant: 'destructive',
      })
    },
  })

  const handlePrivacySubmit = () => {
    updatePrivacyMutation.mutate(privacySettings)
  }

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
    // Nettoyer les champs vides (convertir les chaînes vides en undefined)
    const cleanData: UpdateProfileRequest = {
      first_name: profileData.first_name || undefined,
      last_name: profileData.last_name || undefined,
      phone: profileData.phone || undefined,
      current_city: profileData.current_city || undefined,
      current_country: profileData.current_country || undefined,
      linkedin_url: profileData.linkedin_url || undefined,
      bio: profileData.bio || undefined,
    }
    
    updateProfileMutation.mutate(cleanData)
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
                  onAvatarUpdate={async () => {
                    // Invalider les queries React Query pour recharger le profil
                    queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
                    queryClient.invalidateQueries({ queryKey: ['user'] })
                    // Recharger l'utilisateur depuis l'API pour mettre à jour le header
                    await loadUser()
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
                    value={profileData.first_name || ''}
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
                    value={profileData.last_name || ''}
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
                  value={profile?.email || ''}
                  disabled={true}
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  L&apos;email ne peut pas être modifié
                </p>
              </div>

              {/* Grid avec téléphone et LinkedIn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    disabled={!isEditing}
                  />
                </div>

                {/* Champ LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={profileData.linkedin_url || ''}
                    onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/votre-profil"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Grid ville et pays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-city">Ville actuelle</Label>
                  <Input
                    id="current-city"
                    value={profileData.current_city || ''}
                    onChange={(e) => setProfileData({ ...profileData, current_city: e.target.value })}
                    placeholder="Paris"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-country">Pays actuel</Label>
                  <Select
                    value={profileData.current_country || ''}
                    onValueChange={(value) =>
                      setProfileData({ ...profileData, current_country: value === '__none__' ? '' : value })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="current-country">
                      <SelectValue placeholder="Sélectionner un pays">
                        {profileData.current_country
                          ? `${COUNTRY_FLAGS[profileData.current_country] || ''} ${profileData.current_country}`.trim()
                          : 'Sélectionner un pays'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Aucun —</SelectItem>
                      {countries.map((country: string) => (
                        <SelectItem key={country} value={country}>
                          {COUNTRY_FLAGS[country] || ''} {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Biographie */}
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Parlez de vous..."
                  rows={4}
                  disabled={!isEditing}
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
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Modification...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        // Réinitialiser avec les valeurs du profil
                        if (profile) {
                          setProfileData({
                            first_name: profile.first_name || '',
                            last_name: profile.last_name || '',
                            phone: profile.phone || '',
                            current_city: profile.current_city || '',
                            current_country: profile.current_country || '',
                            linkedin_url: profile.linkedin_url || '',
                            bio: profile.bio || '',
                          })
                        }
                      }}
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault()
                      setIsEditing(true)
                    }}
                  >
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

        {/* Section Confidentialité */}
        <Card>
          <CardHeader>
            <CardTitle>Confidentialité du profil</CardTitle>
            <CardDescription>
              Choisissez les informations visibles sur votre profil public
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Adresse email</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher votre email sur votre profil public
                </p>
              </div>
              <Switch
                checked={privacySettings.show_email}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, show_email: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Téléphone</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher votre téléphone sur votre profil public
                </p>
              </div>
              <Switch
                checked={privacySettings.show_phone}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, show_phone: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Localisation actuelle</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher votre ville et pays actuels
                </p>
              </div>
              <Switch
                checked={privacySettings.show_current_location}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, show_current_location: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>LinkedIn</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher votre profil LinkedIn
                </p>
              </div>
              <Switch
                checked={privacySettings.show_linkedin}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, show_linkedin: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Biographie</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher votre présentation
                </p>
              </div>
              <Switch
                checked={privacySettings.show_bio}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, show_bio: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Année de promotion</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher votre année d'entrée
                </p>
              </div>
              <Switch
                checked={privacySettings.show_entry_year}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, show_entry_year: checked })
                }
              />
            </div>

            {/* Success message */}
            {updatePrivacyMutation.isSuccess && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Préférences de confidentialité mises à jour avec succès</AlertDescription>
              </Alert>
            )}

            {/* Error message */}
            {updatePrivacyMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {updatePrivacyMutation.error instanceof Error
                    ? updatePrivacyMutation.error.message
                    : 'Erreur lors de la mise à jour'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handlePrivacySubmit}
              disabled={updatePrivacyMutation.isPending}
              className="w-full"
            >
              {updatePrivacyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les préférences
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Zone dangereuse */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Zone dangereuse
          </CardTitle>
          <CardDescription>
            La suppression de votre compte est définitive et irréversible.
            Elle sera examinée par un administrateur avant d&apos;être effectuée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={deletionDialogOpen} onOpenChange={setDeletionDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Demander la suppression de mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la demande de suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Votre demande sera transmise aux administrateurs pour validation.
                  Une fois approuvée, votre compte et toutes vos données seront supprimés définitivement.
                  Vous serez déconnecté immédiatement après l&apos;envoi de la demande.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="deletion-reason">
                  Raison (optionnel)
                </Label>
                <Textarea
                  id="deletion-reason"
                  placeholder="Expliquez pourquoi vous souhaitez supprimer votre compte..."
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {deletionReason.length}/500
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={requestDeletionMutation.isPending}>
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={requestDeletionMutation.isPending}
                  onClick={(e) => {
                    e.preventDefault()
                    requestDeletionMutation.mutate(deletionReason)
                  }}
                >
                  {requestDeletionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Confirmer la demande'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
