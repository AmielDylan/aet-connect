'use client'

import { useState } from 'react'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Check, X, Eye, Clock, Loader2, Copy } from 'lucide-react'

export default function AdminPendingPage() {
  const { isAdmin } = useAdminCheck()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [statusFilter, setStatusFilter] = useState('pending')
  const [viewDialog, setViewDialog] = useState<{ open: boolean; request?: any }>({ open: false })
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; requestId?: string; email?: string }>({ open: false })
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId?: string }>({ open: false })
  const [codeDialog, setCodeDialog] = useState<{ open: boolean; code?: string; email?: string }>({ open: false })
  
  // Charger demandes
  const { data: requests, isLoading } = useQuery({
    queryKey: ['access-requests', statusFilter],
    queryFn: () => apiClient.getAccessRequests(statusFilter),
    enabled: isAdmin,
  })
  
  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.approveAccessRequest(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] })
      setApproveDialog({ open: false })
      setCodeDialog({ open: true, code: data.code, email: data.email })
      toast({ title: 'Demande approuvée' })
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erreur', 
        description: error?.message || 'Erreur',
        variant: 'destructive' 
      })
    }
  })
  
  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.rejectAccessRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] })
      toast({ title: 'Demande rejetée' })
      setRejectDialog({ open: false })
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erreur', 
        description: error?.message || 'Erreur',
        variant: 'destructive' 
      })
    }
  })
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />En attente</Badge>
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><Check className="h-3 w-3" />Approuvée</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />Rejetée</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Demandes d'accès</h1>
          <p className="text-muted-foreground mt-1">
            Validation des demandes d'inscription
          </p>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvées</SelectItem>
            <SelectItem value="rejected">Rejetées</SelectItem>
            <SelectItem value="all">Toutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Tableau */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>École</TableHead>
              <TableHead>Promo</TableHead>
              <TableHead>Ambassadeur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests && requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Aucune demande {statusFilter !== 'all' && statusFilter}
                </TableCell>
              </TableRow>
            ) : (
              requests?.map((request: any) => {
                const school = Array.isArray(request.schools) ? request.schools[0] : request.schools
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.first_name} {request.last_name}
                    </TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>
                      {school?.country && `${school.country} `}
                      {school?.acronym || school?.name_fr || 'Non spécifiée'}
                    </TableCell>
                    <TableCell>{request.entry_year}</TableCell>
                    <TableCell>
                      {request.wants_ambassador ? (
                        <Badge variant="outline">Oui</Badge>
                      ) : (
                        <span className="text-muted-foreground">Non</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewDialog({ open: true, request })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => setApproveDialog({ 
                                open: true, 
                                requestId: request.id,
                                email: request.email 
                              })}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setRejectDialog({ 
                                open: true, 
                                requestId: request.id 
                              })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog détails */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {viewDialog.request && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Nom complet</p>
                <p className="text-sm text-muted-foreground">
                  {viewDialog.request.first_name} {viewDialog.request.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{viewDialog.request.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">École</p>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const school = Array.isArray(viewDialog.request.schools) 
                      ? viewDialog.request.schools[0] 
                      : viewDialog.request.schools
                    return school?.name_fr || 'Non spécifiée'
                  })()} ({viewDialog.request.entry_year})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Message</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {viewDialog.request.message || 'Aucun message'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Souhaite être ambassadeur</p>
                <p className="text-sm text-muted-foreground">
                  {viewDialog.request.wants_ambassador ? 'Oui' : 'Non'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog({ open: false })}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog approbation */}
      <AlertDialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Un code d'invitation unique sera généré et affiché. 
              Vous devrez l'envoyer manuellement à <strong>{approveDialog.email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => approveDialog.requestId && approveMutation.mutate(approveDialog.requestId)}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approbation...
                </>
              ) : (
                'Approuver'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog code généré */}
      <Dialog open={codeDialog.open} onOpenChange={(open) => setCodeDialog({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Code d'invitation généré</DialogTitle>
            <DialogDescription>
              Copiez ces informations pour les envoyer au candidat
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email du candidat</Label>
              <div className="flex gap-2">
                <Input 
                  value={codeDialog.email || ''} 
                  readOnly 
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(codeDialog.email || '')
                    toast({ title: 'Email copié !' })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Code */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Code d'invitation</Label>
              <div className="flex gap-2">
                <Input 
                  value={codeDialog.code || ''} 
                  readOnly 
                  className="text-2xl font-mono font-bold text-center tracking-wider"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(codeDialog.code || '')
                    toast({ title: 'Code copié !' })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Message complet */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Message prêt à envoyer</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p>Bonjour,</p>
                <p className="mt-2">
                  Votre demande d'inscription à AET Connect a été approuvée !
                </p>
                <p className="mt-2">
                  Voici votre code d'invitation : <strong className="font-mono text-lg">{codeDialog.code}</strong>
                </p>
                <p className="mt-2">
                  Rendez-vous sur{' '}
                  <a 
                    href={`https://aet-connect.vercel.app/register/with-code?code=${codeDialog.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    https://aet-connect.vercel.app/register/with-code?code={codeDialog.code}
                  </a>{' '}
                  pour créer votre compte.
                </p>
                <p className="mt-2">
                  Ce code est valable 30 jours et peut être utilisé 1 fois.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const message = `Bonjour,\n\nVotre demande d'inscription à AET Connect a été approuvée !\n\nVoici votre code d'invitation : ${codeDialog.code}\n\nRendez-vous sur https://aet-connect.vercel.app/register/with-code?code=${codeDialog.code} pour créer votre compte.\n\nCe code est valable 30 jours et peut être utilisé 1 fois.`
                  navigator.clipboard.writeText(message)
                  toast({ title: 'Message complet copié !', description: 'Prêt à être envoyé par email ou WhatsApp' })
                }}
              >
                Copier le message complet
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setCodeDialog({ open: false })}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog rejet */}
      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => rejectDialog.requestId && rejectMutation.mutate(rejectDialog.requestId)}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejet...
                </>
              ) : (
                'Rejeter'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

