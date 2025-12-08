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
  const totalCodes = codesData?.codes?.length || 0

  // Calculer la limite effective selon le rôle et le statut ambassadeur
  const getEffectiveLimit = () => {
    if (user?.role === 'admin') return 999
    if (user?.is_ambassador) return 15
    return 3
  }

  const effectiveLimit = getEffectiveLimit()
  const isLimitReached = totalCodes >= effectiveLimit && effectiveLimit !== 999

  // Calculer les bornes pour l'input année
  const currentYear = new Date().getFullYear()
  const selectedSchoolData = schools.find(s => s.id === selectedSchool)
  const minYear = selectedSchoolData?.established_year || 1960
  const maxYear = currentYear

  const generateMutation = useMutation({
    mutationFn: async () => {
      // Admin : doit sélectionner école + promo
      if (isAdmin) {
        if (!selectedSchool || !selectedYear) {
          throw new Error('Veuillez sélectionner une école et une promotion')
        }
        return apiClient.generateCode({
          school_id: selectedSchool,
          entry_year: selectedYear,
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
              {/* Admin : sélection manuelle */}
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

          <div className="text-sm text-muted-foreground">
            Ce code pourra être utilisé <strong>1 fois</strong> (inscription unique).
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            {effectiveLimit === 999 
              ? `${totalCodes} code${totalCodes > 1 ? 's' : ''} généré${totalCodes > 1 ? 's' : ''}`
              : `${totalCodes} / ${effectiveLimit} codes générés`
            }
          </p>
          
          {totalCodes >= effectiveLimit && effectiveLimit !== 999 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous avez atteint votre limite de {effectiveLimit} code{effectiveLimit > 1 ? 's' : ''}.
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
            disabled={generateMutation.isPending || isLimitReached || (isAdmin && (!selectedSchool || !selectedYear))}
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

