'use client'

// ═══════════════════════════════════════════════════
// ADMIN DELETIONS PAGE
// Gestion des demandes de suppression de compte
// ═══════════════════════════════════════════════════

import { useState } from 'react'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Check, X, Loader2, Trash2, RefreshCw } from 'lucide-react'
import type { DeletionRequest } from '@/types'

// ═══════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════

function StatusBadge({ status }: { status: DeletionRequest['status'] }) {
  if (status === 'pending') {
    return <Badge variant="outline" className="border-yellow-500 text-yellow-600">En attente</Badge>
  }
  if (status === 'approved') {
    return <Badge variant="destructive">Approuvée</Badge>
  }
  return <Badge variant="secondary">Rejetée</Badge>
}

// ═══════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════

export default function AdminDeletionsPage() {
  const { isAdmin } = useAdminCheck()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState('pending')
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; request?: DeletionRequest }>({ open: false })
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; request?: DeletionRequest }>({ open: false })

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['deletion-requests', statusFilter],
    queryFn: () => apiClient.getDeletionRequests(statusFilter),
    enabled: isAdmin,
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.approveDeletionRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletion-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setApproveDialog({ open: false })
      toast({
        title: 'Compte supprimé',
        description: 'Le compte a été supprimé définitivement.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le compte',
        variant: 'destructive',
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.rejectDeletionRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletion-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setRejectDialog({ open: false })
      toast({
        title: 'Demande rejetée',
        description: 'Le compte a été conservé.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de rejeter la demande',
        variant: 'destructive',
      })
    },
  })

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trash2 className="h-8 w-8 text-destructive" />
            Demandes de suppression
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérer les demandes de suppression de compte des membres
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Filtre status */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvées</SelectItem>
              <SelectItem value="rejected">Rejetées</SelectItem>
              <SelectItem value="all">Toutes</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !requests || requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trash2 className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Aucune demande de suppression{' '}
                {statusFilter !== 'all' && `avec le statut "${statusFilter}"`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>École</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(requests as DeletionRequest[]).map((request) => {
                  const user = request.users
                  const school = user?.schools
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user ? `${user.first_name} ${user.last_name}` : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email || '—'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {school?.acronym || school?.name_fr || '—'}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate">
                          {request.reason || <span className="italic">Aucune raison fournie</span>}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(request.created_at)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setApproveDialog({ open: true, request })}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRejectDialog({ open: true, request })}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Rejeter
                            </Button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <span className="text-xs text-muted-foreground">
                            {request.processed_at ? formatDate(request.processed_at) : '—'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Approuver */}
      <AlertDialog
        open={approveDialog.open}
        onOpenChange={(open) => setApproveDialog({ open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression du compte</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer définitivement le compte de{' '}
              <strong>
                {approveDialog.request?.users
                  ? `${approveDialog.request.users.first_name} ${approveDialog.request.users.last_name}`
                  : 'cet utilisateur'}
              </strong>
              . Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={approveMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                if (approveDialog.request) {
                  approveMutation.mutate(approveDialog.request.id)
                }
              }}
            >
              {approveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Rejeter */}
      <AlertDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter la demande de suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte de{' '}
              <strong>
                {rejectDialog.request?.users
                  ? `${rejectDialog.request.users.first_name} ${rejectDialog.request.users.last_name}`
                  : 'cet utilisateur'}
              </strong>{' '}
              sera conservé et la demande sera marquée comme rejetée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={rejectMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                if (rejectDialog.request) {
                  rejectMutation.mutate(rejectDialog.request.id)
                }
              }}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Rejeter la demande
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
