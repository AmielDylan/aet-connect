'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ShareMenu } from './share-menu'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
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
import { Calendar, Users, Ban } from 'lucide-react'
import type { InvitationCode } from '@/types'

interface CodeCardProps {
  code: InvitationCode
  schoolName: string
  entryYear: string
}

export function CodeCard({ code, schoolName, entryYear }: CodeCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const usagePercentage = (code.current_uses / code.max_uses) * 100
  // Statut calculé par le backend : seule source de vérité
  const isExpired = code.status === 'expired'
  const isFullyUsed = code.status === 'exhausted'
  const isRevoked = code.status === 'revoked'
  const canRevoke = code.status === 'valid' && code.current_uses === 0

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!code.id) {
        throw new Error('ID du code manquant')
      }
      return apiClient.deleteCode(code.id)
    },
    onSuccess: () => {
      toast({
        title: 'Code révoqué',
        description: 'Il ne peut plus servir, et votre invitation est de nouveau disponible',
      })
      queryClient.invalidateQueries({ queryKey: ['my-codes'] })
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de révoquer le code',
        variant: 'destructive',
      })
    },
  })

  const getStatusBadge = () => {
    if (isRevoked) {
      return <Badge variant="destructive">Révoqué</Badge>
    }
    if (isExpired) {
      return <Badge variant="secondary">Expiré</Badge>
    }
    if (isFullyUsed) {
      return <Badge variant="secondary">Complet</Badge>
    }
    return <Badge variant="default">Actif</Badge>
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-lg font-mono font-bold whitespace-nowrap">
                  {code.code}
                </code>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground">
                {schoolName} • Promo {entryYear}
              </p>
            </div>
            <div className="flex gap-2">
              {!isRevoked && !isExpired && !isFullyUsed && (
                <ShareMenu
                  code={code.code}
                  schoolName={schoolName}
                  entryYear={entryYear}
                />
              )}
              
              {/* Révoquer : seulement un code encore valable et jamais utilisé */}
              {canRevoke && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Révoquer ce code">
                    <Ban className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Révoquer ce code ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Le code <strong>{code.code}</strong> ne pourra plus servir à s&apos;inscrire.
                      Votre invitation redevient disponible pour un autre code.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Révoquer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              )}
            </div>
          </div>

          {/* Usage stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                Utilisation
              </span>
              <span className="font-medium">
                {code.current_uses === 0 ? 'Non utilisé' : 'Utilisé'}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          {/* Date info */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Créé le {new Date(code.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

