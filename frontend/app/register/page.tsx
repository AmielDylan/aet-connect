'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useJoinPromo } from '@/hooks/use-join-promo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api'
import { Loader2, Info, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [schoolId, setSchoolId] = useState('')
  const [entryYear, setEntryYear] = useState('')
  const { data: schools, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => apiClient.getSchools(),
  })

  // Validation + bon parcours (code ou demande d'accès) : partagés avec la page d'accueil
  const { join, error, isPending } = useJoinPromo(schools?.schools ?? [])
  const handleSubmit = () => join(schoolId, entryYear)

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Rejoindre AET Connect</h1>
          <p className="text-lg text-muted-foreground">
            Commencez par indiquer votre école et votre année d&apos;entrée
          </p>
        </div>

        {/* Alert info */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Le système déterminera automatiquement le parcours d&apos;inscription adapté à votre situation
          </AlertDescription>
        </Alert>

        {/* Formulaire unique */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>
              Ces informations nous permettent de vous guider vers le bon parcours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* École */}
            <div className="space-y-2">
              <Label htmlFor="school">
                École militaire <span className="text-destructive">*</span>
              </Label>
              {isLoading ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select value={schoolId} onValueChange={setSchoolId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre école" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools?.schools?.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name_fr} ({school.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Année d'entrée */}
            <div className="space-y-2">
              <Label htmlFor="year">
                Année d&apos;entrée <span className="text-destructive">*</span>
              </Label>
              <Input
                id="year"
                type="text"
                placeholder="Ex: 2000"
                value={entryYear}
                inputMode="numeric"
                onChange={(e) => setEntryYear(e.target.value)}
                className={error ? 'border-destructive' : ''}
                maxLength={4}
                disabled={!schoolId}
                required
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
              {!error && (
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    const school = schools?.schools?.find(s => s.id === schoolId)
                    const minYear = school?.established_year || 1950
                    return school?.established_year 
                      ? `Format : YYYY (minimum ${minYear}, créée en ${school.established_year})`
                      : `Format : YYYY (minimum ${minYear})`
                  })()}
                </p>
              )}
            </div>

            {/* Erreur */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Bouton */}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Lien vers login */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Déjà inscrit ?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push('/login')}
                >
                  Se connecter
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
