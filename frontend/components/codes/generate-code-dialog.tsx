'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Loader2, AlertCircle } from 'lucide-react'

export function GenerateCodeDialog() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [open, setOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  // Admin uniquement : code valable pour toutes les écoles, et nombre d'inscriptions
  const [universal, setUniversal] = useState(false)
  const [maxUses, setMaxUses] = useState('1')

  // Charger les écoles pour admin
  const { data: schoolsData } = useQuery({
    queryKey: ['schools'],
    queryFn: () => apiClient.getSchools(),
    enabled: isAdmin,
  })

  // Charger les codes existants pour calculer la limite
  const { data: codesData } = useQuery({
    queryKey: ['my-codes'],
    queryFn: () => apiClient.getMyCodes(),
  })

  const schools = schoolsData?.schools || []
  // Quota calculé par le backend (module Code d'invitation)
  const quota = codesData?.quota
  const isLimitReached = quota?.remaining === 0

  // Calculer les bornes pour l'input année
  const currentYear = new Date().getFullYear()
  const selectedSchoolData = schools.find(s => s.id === selectedSchool)
  const minYear = selectedSchoolData?.established_year || 1960
  const maxYear = currentYear

  const generateMutation = useMutation({
    mutationFn: async () => {
      // Admin : doit sélectionner école + promo
      if (isAdmin) {
        const max_uses = Math.max(1, Number(maxUses) || 1)
        if (universal) return apiClient.generateCode({ universal: true, max_uses })
        if (!selectedSchool || !selectedYear) {
          throw new Error('Veuillez sélectionner une école et une promotion')
        }
        return apiClient.generateCode({
          school_id: selectedSchool,
          entry_year: selectedYear,
          max_uses,
        })
      }
      
      // Alumni/Ambassador : auto avec leurs infos
      return apiClient.generateCode()
    },
    onSuccess: (data) => {
      toast({
        title: 'Code généré',
        description: `Votre code d'invitation "${data.code}" a été créé avec succès`,
      })
      queryClient.invalidateQueries({ queryKey: ['my-codes'] })
      setOpen(false)
      setSelectedSchool('')
      setSelectedYear('')
      setUniversal(false)
      setMaxUses('1')
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de générer le code',
        variant: 'destructive',
      })
    },
  })

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Générer un code
          </Button>
        </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Générer un code d'invitation</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? 'Créez un code pour n\'importe quelle école et promotion.'
              : 'Le code sera généré automatiquement avec vos informations.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isAdmin ? (
            <>
              {/* Admin : code universel ou promo précise */}
              <div className="flex items-center gap-2">
                <Checkbox id="universal" checked={universal} onCheckedChange={(v) => setUniversal(v === true)} />
                <Label htmlFor="universal" className="font-normal">
                  Code universel : la personne choisit son école et sa promotion
                </Label>
              </div>

              {!universal && (<>
              <div className="space-y-2">
                <Label htmlFor="school">École</Label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Sélectionnez une école" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name_fr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Promotion</Label>
                <Input
                  id="year"
                  type="number"
                  min={minYear}
                  max={maxYear}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  placeholder={`Ex: ${currentYear}`}
                  required
                />
                {selectedSchool && (
                  <p className="text-xs text-muted-foreground">
                    Entre {minYear} et {maxYear}
                  </p>
                )}
              </div>
              </>)}

              <div className="space-y-2">
                <Label htmlFor="max-uses">Nombre d&apos;inscriptions possibles</Label>
                <Input
                  id="max-uses"
                  type="number"
                  min={1}
                  max={500}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              {/* Alumni/Ambassador : affichage info */}
              <div className="text-sm">
                <p><strong>École :</strong> {user?.school_name || user?.school?.name_fr || 'Non spécifiée'}</p>
                <p><strong>Promotion :</strong> {user?.entry_year || 'Non spécifiée'}</p>
              </div>
            </>
          )}

          {!isAdmin && (
            <div className="text-sm text-muted-foreground">
              Ce code servira à <strong>une seule inscription</strong> et restera valable 30 jours.
            </div>
          )}

          {quota && quota.limit !== null && (
            <p className="text-sm text-muted-foreground mt-2">
              {quota.remaining} invitation{(quota.remaining ?? 0) > 1 ? 's' : ''} disponible{(quota.remaining ?? 0) > 1 ? 's' : ''} sur {quota.limit}
            </p>
          )}

          {isLimitReached && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vos {quota?.limit} invitations sont en cours ou utilisées. Révoquez un code non utilisé pour en libérer une.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={generateMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || isLimitReached || (isAdmin && !universal && (!selectedSchool || !selectedYear))}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              'Générer'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

