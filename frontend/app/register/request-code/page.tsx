'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { RegistrationSteps } from '@/components/registration/registration-steps'
import { SchoolYearSelector } from '@/components/registration/school-year-selector'
import { FormField } from '@/components/registration/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/api'
import { Loader2, CheckCircle2, AlertCircle, Info, Users } from 'lucide-react'
import { toast } from 'sonner'

const STEPS = [
  { number: 1, title: 'École & Promo', description: 'Sélection' },
  { number: 2, title: 'Informations', description: 'Formulaire' },
  { number: 3, title: 'Envoi', description: 'Demande' },
  { number: 4, title: 'Confirmation', description: 'Instructions' },
]

export default function RequestCodePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Étape 1 : École + Promo
  const [schoolId, setSchoolId] = useState('')
  const [entryYear, setEntryYear] = useState('')
  const [, setPromoExists] = useState(false) // Setter utilisé dans checkPromoMutation
  const [hasAmbassador, setHasAmbassador] = useState(false)
  const [memberCount, setMemberCount] = useState(0)
  const [ambassadorInfo, setAmbassadorInfo] = useState<{
    first_name: string
    last_name: string
  } | null>(null)
  const [step1Error, setStep1Error] = useState('')

  // Étape 2 : Informations
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [message, setMessage] = useState('')
  const [step2Error, setStep2Error] = useState('')

  // Récipient de la demande
  const [recipientName, setRecipientName] = useState('')

  // Mutation vérification promo
  const checkPromoMutation = useMutation({
    mutationFn: () =>
      apiClient.checkSchoolPromo({
        school_id: schoolId,
        entry_year: entryYear,
      }),
    onSuccess: (data) => {
      if (!data.exists) {
        setPromoExists(false)
        setStep1Error(
          'Cette promotion n&apos;existe pas encore. Utilisez le workflow "Demande d&apos;accès initial".'
        )
      } else {
        setPromoExists(true)
        setHasAmbassador(data.has_ambassador)
        setMemberCount(data.member_count)
        setAmbassadorInfo(data.ambassador_info)
        setStep1Error('')
        setCurrentStep(2)
        toast.success('Promotion trouvée !')
      }
    },
    onError: () => {
      setStep1Error('Erreur lors de la vérification de la promotion')
      toast.error('Erreur lors de la vérification')
    },
  })

  // Mutation demande de code
  const requestCodeMutation = useMutation({
    mutationFn: () =>
      apiClient.requestCodeFromPeer({
        school_id: schoolId,
        entry_year: entryYear,
        first_name: firstName,
        last_name: lastName,
        message,
      }),
    onSuccess: (data) => {
      setRecipientName(data.recipient_name)
      setCurrentStep(4)
      toast.success('Demande envoyée !')
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
    if (!message.trim() || message.length < 10) {
      setStep2Error('Message trop court (minimum 10 caractères)')
      return
    }

    setStep2Error('')
    setCurrentStep(3)
  }

  // Handler Étape 3 (confirmation avant envoi)
  const handleStep3Confirm = () => {
    requestCodeMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Demande de code entre pairs</h1>
          <p className="text-muted-foreground mt-2">
            Demandez un code d&apos;invitation à un membre de votre promotion
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
                    Ce formulaire permet de demander un code d&apos;invitation à un membre de votre promotion déjà inscrit.
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
                {/* Info sur la promo */}
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>
                        <strong>{memberCount}</strong> membre{memberCount > 1 ? 's' : ''} déjà inscrit{memberCount > 1 ? 's' : ''} dans cette promotion
                      </p>
                      {hasAmbassador && ambassadorInfo && (
                        <p className="text-sm">
                          Ambassadeur : <strong>{ambassadorInfo.first_name} {ambassadorInfo.last_name}</strong>
                        </p>
                      )}
                      {!hasAmbassador && (
                        <p className="text-sm text-muted-foreground">
                          Aucun ambassadeur désigné pour cette promotion
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Votre demande sera envoyée à {hasAmbassador && ambassadorInfo 
                      ? `l&apos;ambassadeur ${ambassadorInfo.first_name} ${ambassadorInfo.last_name}`
                      : 'un membre de votre promotion'
                    }. Présentez-vous pour faciliter la validation.
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
                  id="message"
                  type="textarea"
                  label="Message"
                  placeholder="Présentez-vous et expliquez pourquoi vous souhaitez rejoindre AET Connect..."
                  value={message}
                  onChange={setMessage}
                  required
                  description="Minimum 10 caractères"
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
                          const subject = encodeURIComponent('Problème demande de code')
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
                    <p className="text-sm font-medium">Destinataire</p>
                    <p className="text-sm text-muted-foreground">
                      {hasAmbassador && ambassadorInfo
                        ? `${ambassadorInfo.first_name} ${ambassadorInfo.last_name} (Ambassadeur)`
                        : 'Un membre de votre promotion'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Votre identité</p>
                    <p className="text-sm text-muted-foreground">{firstName} {lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Message</p>
                    <p className="text-sm text-muted-foreground">{message}</p>
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Modifier
                  </Button>
                  <Button
                    onClick={handleStep3Confirm}
                    disabled={requestCodeMutation.isPending}
                  >
                    {requestCodeMutation.isPending && (
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
                    Votre demande de code a été transmise à <strong>{recipientName}</strong>.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Vous recevrez le code d&apos;invitation par email une fois validé.
                  </p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Une fois que vous aurez reçu le code, utilisez le workflow &quot;Inscription avec code&quot; pour créer votre compte.
                  </AlertDescription>
                </Alert>

                {!hasAmbassador && (
                  <Alert className="mt-6">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-2">Aucun ambassadeur pour votre promotion ?</p>
                      <p className="text-sm mb-3">
                        Contactez les administrateurs d&apos;AET Connect pour obtenir de l&apos;aide.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const subject = encodeURIComponent('Demande code d\'invitation')
                          const body = encodeURIComponent(`École : ${schoolId}\nAnnée : ${entryYear}\n\nJe n'ai pas d'ambassadeur pour ma promotion et j'aimerais obtenir un code d'invitation.`)
                          window.location.href = `mailto:admin@aetconnect.com?subject=${subject}&body=${body}`
                        }}
                      >
                        Contacter les admins
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => router.push('/register')}>
                    Retour aux options d&apos;inscription
                  </Button>
                  <Button onClick={() => router.push('/')}>
                    Retour à l&apos;accueil
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


