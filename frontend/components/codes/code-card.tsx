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
import { Calendar, Users, Trash2 } from 'lucide-react'
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
  const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
  const isFullyUsed = code.current_uses >= code.max_uses
  const isRevoked = !code.is_active

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!code.id) {
        throw new Error('ID du code manquant')
      }
      return apiClient.deleteCode(code.id)
    },
    onSuccess: () => {
      toast({
        title: 'Code supprimé',
        description: 'Le code a été supprimé avec succès',
      })
      queryClient.invalidateQueries({ queryKey: ['my-codes'] })
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le code',
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
                <code className="text-lg font-mono font-bold">
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
              
              {/* Bouton supprimer */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce code ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Le code <strong>{code.code}</strong> sera
                      définitivement supprimé.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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

