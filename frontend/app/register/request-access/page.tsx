'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { RegistrationSteps } from '@/components/registration/registration-steps'
import { SchoolYearSelector } from '@/components/registration/school-year-selector'
import { FormField } from '@/components/registration/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api'
import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

const STEPS = [
  { number: 1, title: 'École & Promo', description: 'Sélection' },
  { number: 2, title: 'Informations', description: 'Formulaire' },
  { number: 3, title: 'Envoi', description: 'Demande' },
  { number: 4, title: 'Confirmation', description: 'En attente' },
]

export default function RequestAccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)

  // Étape 1 : École + Promo
  const [schoolId, setSchoolId] = useState('')
  const [entryYear, setEntryYear] = useState('')
  const [, setPromoExists] = useState(false) // Setter utilisé dans checkPromoMutation
  const [step1Error, setStep1Error] = useState('')

  // Récupérer les query params au chargement
  useEffect(() => {
    const school = searchParams.get('school')
    const year = searchParams.get('year')
    
    // Mettre à jour les états basés sur les query params
    if (school || year) {
      if (school) setSchoolId(school)
      if (year) setEntryYear(year)
      if (school && year) {
        setCurrentStep(2) // Passer directement à l'étape du formulaire
      }
    }
  }, [searchParams])

  // Étape 2 : Informations
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [wantsAmbassador, setWantsAmbassador] = useState(false)
  const [step2Error, setStep2Error] = useState('')

  // Mutation vérification promo
  const checkPromoMutation = useMutation({
    mutationFn: () =>
      apiClient.checkSchoolPromo({
        school_id: schoolId,
        entry_year: entryYear,
      }),
    onSuccess: (data) => {
      if (data.exists) {
        setPromoExists(true)
        setStep1Error(
          `Cette promotion existe déjà (${data.member_count} membre${data.member_count > 1 ? 's' : ''}). Utilisez le workflow "Inscription avec code" ou "Demande de code entre pairs".`
        )
      } else {
        setPromoExists(false)
        setStep1Error('')
        setCurrentStep(2)
        toast.success('Vous pouvez créer cette promotion !')
      }
    },
    onError: () => {
      setStep1Error('Erreur lors de la vérification de la promotion')
      toast.error('Erreur lors de la vérification')
    },
  })

  // Mutation demande d'accès
  const requestAccessMutation = useMutation({
    mutationFn: () =>
      apiClient.requestInitialAccess({
        school_id: schoolId,
        entry_year: entryYear,
        first_name: firstName,
        last_name: lastName,
        email,
        message,
        wants_ambassador: wantsAmbassador,
      }),
    onSuccess: () => {
      setCurrentStep(4)
      toast.success('Demande envoyée avec succès !')
    },
    onError: (error: Error) => {
      setStep2Error(error.message || 'Erreur lors de l&apos;envoi de la demande')
      toast.error('Erreur lors de l&apos;envoi')
    },
  })

  // Récupérer les écoles pour avoir established_year
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => apiClient.getSchools(),
  })

  // Validation année avec established_year
  const validateYear = (year: string): boolean => {
    const yearNum = parseInt(year, 10)
    const currentYear = new Date().getFullYear()
    
    // Récupérer l'école sélectionnée pour avoir established_year
    const selectedSchoolData = schoolsData?.schools?.find(s => s.id === schoolId)
    const minYear = selectedSchoolData?.established_year || 1950

    if (!/^\d{4}$/.test(year)) {
      setStep1Error('Format invalide (YYYY requis)')
      return false
    }

    if (yearNum < minYear) {
      if (selectedSchoolData?.established_year) {
        setStep1Error(`Cette école a été créée en ${selectedSchoolData.established_year}. L'année minimale est ${selectedSchoolData.established_year}.`)
      } else {
        setStep1Error(`Année minimale : ${minYear}`)
      }
      return false
    }

    if (yearNum > currentYear + 1) {
      setStep1Error(`Année doit être au maximum ${currentYear + 1}`)
      return false
    }

    return true
  }

  // Handler Étape 1
  const handleStep1Next = () => {
    setStep1Error('')
    
    if (!schoolId) {
      setStep1Error('Veuillez sélectionner une école')
      return
    }

    if (!entryYear) {
      setStep1Error('Veuillez entrer une année')
      return
    }

    if (!validateYear(entryYear)) {
      return
    }

    checkPromoMutation.mutate()
  }

  // Handler Étape 2
  const handleStep2Next = () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setStep2Error('Prénom et nom requis')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setStep2Error('Email invalide')
      return
    }
    if (!message.trim() || message.length < 10) {
      setStep2Error('Message trop court (minimum 10 caractères)')
      return
    }

    setStep2Error('')
    setCurrentStep(3)
  }

  // Handler Étape 3 (confirmation avant envoi)
  const handleStep3Confirm = () => {
    requestAccessMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Demande d&apos;accès initial</h1>
          <p className="text-muted-foreground mt-2">
            Vous êtes le premier membre de votre promotion ? Demandez l&apos;accès à AET Connect
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
            {/* Étape 1 : École + Promo */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Ce formulaire est destiné aux <strong>premiers membres</strong> d&apos;une promotion. 
                    Si votre promotion existe déjà, utilisez un autre workflow.
                  </AlertDescription>
                </Alert>

                <SchoolYearSelector
                  selectedSchoolId={schoolId}
                  selectedYear={entryYear}
                  onSchoolChange={setSchoolId}
                  onYearChange={setEntryYear}
                  schools={schoolsData?.schools || []}
                  isLoading={schoolsLoading}
                  error={step1Error}
                />

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => router.push('/register')}>
                    Retour
                  </Button>
                  <Button
                    onClick={handleStep1Next}
                    disabled={checkPromoMutation.isPending}
                  >
                    {checkPromoMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Vérifier et continuer
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 2 : Formulaire demande */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Votre demande sera examinée par un administrateur AET Connect. Vous recevrez un email une fois validée.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    id="first-name"
                    label="Prénom"
                    placeholder="Jean"
                    value={firstName}
                    onChange={setFirstName}
                    required
                  />
                  <FormField
                    id="last-name"
                    label="Nom"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={setLastName}
                    required
                  />
                </div>

                <FormField
                  id="email"
                  type="email"
                  label="Email"
                  placeholder="jean.dupont@example.com"
                  value={email}
                  onChange={setEmail}
                  required
                  description="Vous recevrez la réponse à cette adresse"
                />

                <FormField
                  id="message"
                  type="textarea"
                  label="Message de motivation"
                  placeholder="Présentez-vous et expliquez pourquoi vous souhaitez rejoindre AET Connect..."
                  value={message}
                  onChange={setMessage}
                  required
                  description="Minimum 10 caractères"
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ambassador"
                    checked={wantsAmbassador}
                    onCheckedChange={(checked) => setWantsAmbassador(checked as boolean)}
                  />
                  <Label
                    htmlFor="ambassador"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Je souhaite devenir ambassadeur de ma promotion
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Les ambassadeurs peuvent générer jusqu&apos;à 15 codes d&apos;invitation (vs 3 pour les membres normaux)
                </p>

                {step2Error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="mb-3">{step2Error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const subject = encodeURIComponent('Problème demande d\'accès')
                          const body = encodeURIComponent(`Message d'erreur : ${step2Error}\n\nÉcole : ${schoolId}\nAnnée : ${entryYear}`)
                          window.location.href = `mailto:admin@aetconnect.com?subject=${subject}&body=${body}`
                        }}
                      >
                        Contacter les admins AET Connect
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Retour
                  </Button>
                  <Button onClick={handleStep2Next}>
                    Continuer
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 3 : Confirmation avant envoi */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Vérifiez vos informations avant d&apos;envoyer votre demande
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 border rounded-lg p-4">
                  <div>
                    <p className="text-sm font-medium">Identité</p>
                    <p className="text-sm text-muted-foreground">{firstName} {lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Message</p>
                    <p className="text-sm text-muted-foreground">{message}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ambassadeur</p>
                    <p className="text-sm text-muted-foreground">
                      {wantsAmbassador ? 'Oui' : 'Non'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Modifier
                  </Button>
                  <Button
                    onClick={handleStep3Confirm}
                    disabled={requestAccessMutation.isPending}
                  >
                    {requestAccessMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Envoyer la demande
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 4 : Confirmation */}
            {currentStep === 4 && (
              <div className="text-center space-y-6 py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold">Demande envoyée !</h3>
                  <p className="text-muted-foreground mt-2">
                    Votre demande d&apos;accès a été transmise à l&apos;équipe AET Connect.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Vous recevrez un email à <strong>{email}</strong> une fois votre demande validée.
                  </p>
                </div>

                <Button onClick={() => router.push('/')}>
                  Retour à l&apos;accueil
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


