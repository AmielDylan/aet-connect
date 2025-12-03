'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { RegistrationSteps } from '@/components/registration/registration-steps'
import { FormField } from '@/components/registration/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/api'
import { Loader2, CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const STEPS = [
  { number: 1, title: 'Code', description: 'Vérification' },
  { number: 2, title: 'Informations', description: 'Formulaire' },
  { number: 3, title: 'Validation', description: 'Création compte' },
]

export default function RegisterWithCodePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Étape 1 : Code invitation
  const [invitationCode, setInvitationCode] = useState('')
  const [step1Error, setStep1Error] = useState('') // Erreur SYSTÈME uniquement (API, code invalide)

  // Données du code vérifié
  const [verifiedSchoolId, setVerifiedSchoolId] = useState('')
  const [verifiedEntryYear, setVerifiedEntryYear] = useState('')
  const [verifiedSchoolName, setVerifiedSchoolName] = useState('')

  // Étape 2 : Informations utilisateur
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]) // Erreurs VALIDATION mot de passe
  const [step2Error, setStep2Error] = useState('') // Erreur SYSTÈME uniquement (API inscription)
  
  // Erreurs de VALIDATION pour les champs
  const [emailError, setEmailError] = useState('')
  const [nameError, setNameError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  // Validation mot de passe
  const validatePassword = (pwd: string) => {
    const errors: string[] = []
    if (pwd.length < 8) errors.push('Au moins 8 caractères')
    if (!/[A-Z]/.test(pwd)) errors.push('Au moins une majuscule')
    if (!/[a-z]/.test(pwd)) errors.push('Au moins une minuscule')
    if (!/[0-9]/.test(pwd)) errors.push('Au moins un chiffre')
    setPasswordErrors(errors)
    return errors.length === 0
  }

  // Mutation vérification code
  const verifyCodeMutation = useMutation({
    mutationFn: () =>
      apiClient.verifyInvitationCode({
        code: invitationCode,
        // Pour la vérification initiale, on utilise des valeurs temporaires
        // Le backend retournera les vraies valeurs si le code est valide (pour codes admin)
        // Pour codes membres, il faut que ça corresponde exactement
        school_id: verifiedSchoolId || '00000000-0000-0000-0000-000000000000',
        entry_year: verifiedEntryYear || '2000',
      }),
    onSuccess: (data) => {
      if (data.valid) {
        // Stocker les données du code
        if (data.school_id) setVerifiedSchoolId(data.school_id)
        if (data.entry_year) setVerifiedEntryYear(data.entry_year)
        if (data.school_name) setVerifiedSchoolName(data.school_name)

        setStep1Error('')
        setCurrentStep(2)
        toast.success('Code valide !')
      } else {
        setStep1Error(data.message)
        toast.error(data.message)
      }
    },
    onError: () => {
      setStep1Error('Erreur lors de la vérification du code')
      toast.error('Erreur lors de la vérification')
    },
  })

  // Mutation inscription
  const registerMutation = useMutation({
    mutationFn: () =>
      apiClient.completeRegistration({
        invitation_code: invitationCode,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
    onSuccess: () => {
      setCurrentStep(3)
      toast.success('Inscription réussie !')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    },
    onError: (error: Error) => {
      setStep2Error(error.message || 'Erreur lors de l\'inscription')
      toast.error('Erreur lors de l\'inscription')
    },
  })

  // Handler Étape 1
  const handleStep1Next = () => {
    // Validation locale : champ requis (mais on l'affiche dans Alert car c'est une erreur de soumission)
    if (!invitationCode.trim()) {
      setStep1Error('Veuillez entrer votre code d\'invitation')
      return
    }
    setStep1Error('') // Réinitialiser avant la vérification
    verifyCodeMutation.mutate()
  }

  // Handler Étape 2
  const handleStep2Next = () => {
    // Réinitialiser toutes les erreurs
    setNameError('')
    setEmailError('')
    setConfirmPasswordError('')
    setStep2Error('')
    
    let hasValidationError = false
    
    // Validation : Prénom et nom
    if (!firstName.trim() || !lastName.trim()) {
      setNameError('Prénom et nom requis')
      hasValidationError = true
    }
    
    // Validation : Email
    if (!email.trim()) {
      setEmailError('Email requis')
      hasValidationError = true
    } else if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Format d\'email invalide')
      hasValidationError = true
    }
    
    // Validation : Mot de passe
    if (!validatePassword(password)) {
      // Les erreurs sont déjà affichées via passwordErrors
      hasValidationError = true
    }
    
    // Validation : Confirmation mot de passe
    if (password !== confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas')
      hasValidationError = true
    }
    
    if (hasValidationError) {
      return
    }

    // Toutes les validations passent → appel API
    registerMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Inscription avec code d&apos;invitation</h1>
          <p className="text-muted-foreground mt-2">
            Créez votre compte en quelques étapes
          </p>
        </div>

        {/* Steps indicator */}
        <RegistrationSteps currentStep={currentStep} steps={STEPS} />

        {/* Content */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Étape 1 : Code invitation */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Entrez le code d&apos;invitation fourni par un ambassadeur ou un membre de votre promotion
                  </AlertDescription>
                </Alert>

                <FormField
                  id="invitation-code"
                  label="Code d'invitation"
                  placeholder="Entrez votre code (ex: USER-ABC123)"
                  value={invitationCode}
                  onChange={setInvitationCode}
                  // error supprimé : step1Error est une erreur SYSTÈME, affichée dans Alert uniquement
                  required
                  disabled={verifyCodeMutation.isPending}
                />

                {step1Error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="mb-3">{step1Error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const subject = encodeURIComponent('Problème code d\'invitation')
                          const body = encodeURIComponent(`Code saisi : ${invitationCode}\n\nMessage d'erreur : ${step1Error}`)
                          window.location.href = `mailto:admin@aetconnect.com?subject=${subject}&body=${body}`
                        }}
                      >
                        Contacter les admins AET Connect
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => router.push('/register')}>
                    Retour
                  </Button>
                  <Button
                    onClick={handleStep1Next}
                    disabled={verifyCodeMutation.isPending}
                  >
                    {verifyCodeMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Vérifier le code
                  </Button>
                </div>

                {/* Lien vers demande de code */}
                <div className="text-center text-sm border-t pt-4">
                  <p className="text-muted-foreground mb-2">
                    Vous n&apos;avez pas de code d&apos;invitation ?
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search)
                      const school = params.get('school')
                      const year = params.get('year')
                      
                      if (school && year) {
                        router.push(`/register/request-code?school=${school}&year=${year}`)
                      } else {
                        router.push('/register/request-code')
                      }
                    }}
                  >
                    Contacter un ambassadeur de ma promotion
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 2 : Formulaire inscription */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    Code validé ! Complétez vos informations pour créer votre compte.
                  </AlertDescription>
                </Alert>

                {/* Informations pré-remplies (lecture seule) */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Informations du code :</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">École :</span>
                      <span className="ml-2 font-medium">{verifiedSchoolName || 'Chargement...'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Promotion :</span>
                      <span className="ml-2 font-medium">{verifiedEntryYear}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    id="first-name"
                    label="Prénom"
                    placeholder="Jean"
                    value={firstName}
                    onChange={(value) => {
                      setFirstName(value)
                      if (nameError) setNameError('') // Réinitialiser l'erreur lors de la saisie
                    }}
                    error={nameError}
                    required
                    disabled={registerMutation.isPending}
                  />
                  <FormField
                    id="last-name"
                    label="Nom"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(value) => {
                      setLastName(value)
                      if (nameError) setNameError('') // Réinitialiser l'erreur lors de la saisie
                    }}
                    error={nameError}
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>

                <FormField
                  id="email"
                  type="email"
                  label="Email"
                  placeholder="jean.dupont@example.com"
                  value={email}
                  onChange={(value) => {
                    setEmail(value)
                    if (emailError) setEmailError('') // Réinitialiser l'erreur lors de la saisie
                  }}
                  error={emailError}
                  required
                  disabled={registerMutation.isPending}
                />

                <div className="space-y-2">
                  <FormField
                    id="password"
                    type="password"
                    label="Mot de passe"
                    placeholder="Min 8 caractères"
                    value={password}
                    onChange={(value) => {
                      setPassword(value)
                      validatePassword(value)
                    }}
                    required
                    disabled={registerMutation.isPending}
                    description="Doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
                  />
                  {passwordErrors.length > 0 && (
                    <ul className="text-xs space-y-1 -mt-4">
                      {passwordErrors.map((err, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-destructive">✗</span> {err}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <FormField
                  id="confirm-password"
                  type="password"
                  label="Confirmer le mot de passe"
                  placeholder="Retapez votre mot de passe"
                  value={confirmPassword}
                  onChange={(value) => {
                    setConfirmPassword(value)
                    if (confirmPasswordError) setConfirmPasswordError('') // Réinitialiser l'erreur lors de la saisie
                    // Vérifier aussi si les mots de passe correspondent maintenant
                    if (value && password && value === password) {
                      setConfirmPasswordError('')
                    }
                  }}
                  error={confirmPasswordError}
                  required
                  disabled={registerMutation.isPending}
                />

                {step2Error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="mb-3">{step2Error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const subject = encodeURIComponent('Problème inscription')
                          const body = encodeURIComponent(`Message d'erreur : ${step2Error}\n\nCode d'invitation : ${invitationCode}`)
                          window.location.href = `mailto:admin@aetconnect.com?subject=${subject}&body=${body}`
                        }}
                      >
                        Contacter les admins AET Connect
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    disabled={registerMutation.isPending}
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleStep2Next}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Créer mon compte
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 3 : Success */}
            {currentStep === 3 && (
              <div className="text-center space-y-6 py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold">Inscription réussie !</h3>
                  <p className="text-muted-foreground mt-2">
                    Votre compte a été créé avec succès. Redirection vers la page de connexion...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
