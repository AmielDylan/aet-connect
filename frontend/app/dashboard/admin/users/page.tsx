'use client'

import { useState } from 'react'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { MoreHorizontal, Search, Trash2, Shield, Star, Loader2 } from 'lucide-react'

export default function AdminUsersPage() {
  const { isAdmin } = useAdminCheck()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId?: string; userName?: string }>({
    open: false
  })
  
  // Charger utilisateurs
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, page],
    queryFn: () => apiClient.getAdminUsers({
      search,
      role: roleFilter,
      page,
      limit: 50
    }),
    enabled: isAdmin,
  })
  
  const users = data?.users || []
  const pagination = data?.pagination
  
  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'Rôle mis à jour' })
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.error || 'Erreur'
      toast({ 
        title: 'Impossible de modifier', 
        description: message,
        variant: 'destructive' 
      })
    }
  })
  
  const updateAmbassadorMutation = useMutation({
    mutationFn: ({ userId, is_ambassador }: { userId: string; is_ambassador: boolean }) =>
      apiClient.updateUserAmbassador(userId, is_ambassador),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'Statut ambassadeur mis à jour' })
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.error || 'Erreur'
      toast({ 
        title: 'Erreur', 
        description: message,
        variant: 'destructive' 
      })
    }
  })
  
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiClient.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'Utilisateur supprimé' })
      setDeleteDialog({ open: false })
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.error || 'Erreur lors de la suppression'
      toast({ 
        title: 'Impossible de supprimer', 
        description: message,
        variant: 'destructive' 
      })
    }
  })
  
  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin: 'destructive',
      moderator: 'default',
      alumni: 'secondary'
    }
    return <Badge variant={variants[role] || 'secondary'}>{role}</Badge>
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
      <h1 className="text-3xl font-bold mb-8">Gestion des Utilisateurs</h1>
      
      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1) // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={(value) => {
          setRoleFilter(value)
          setPage(1) // Reset to first page on filter change
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="alumni">Alumni</SelectItem>
            <SelectItem value="moderator">Modérateur</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
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
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => {
                const school = Array.isArray(user.schools) ? user.schools[0] : user.schools
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {school?.country && `${school.country} `}
                      {school?.acronym || school?.name_fr || 'Non spécifiée'}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.is_ambassador && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          Ambassadeur
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            Changer rôle
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'alumni' })}
                            disabled={user.role === 'alumni' || (user.id === currentUser?.id && user.role === 'admin')}
                          >
                            Promouvoir Alumni
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'moderator' })}
                            disabled={user.role === 'moderator' || (user.id === currentUser?.id && user.role === 'admin')}
                          >
                            Promouvoir Modérateur
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'admin' })}
                            disabled={user.role === 'admin'}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Promouvoir Admin
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => updateAmbassadorMutation.mutate({
                              userId: user.id,
                              is_ambassador: !user.is_ambassador
                            })}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            {user.is_ambassador ? 'Retirer' : 'Nommer'} Ambassadeur
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteDialog({
                              open: true,
                              userId: user.id,
                              userName: `${user.first_name} ${user.last_name}`
                            })}
                            disabled={user.id === currentUser?.id || user.role === 'admin'}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Précédent
          </Button>
          <span className="py-2 px-4 text-sm text-muted-foreground">
            Page {page} sur {pagination.totalPages} ({pagination.total} utilisateurs)
          </span>
          <Button
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
      
      {/* Dialog suppression */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteDialog.userName}</strong> ?
              Cette action est irréversible et supprimera également tous les codes associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleteDialog.userId && deleteUserMutation.mutate(deleteDialog.userId)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

