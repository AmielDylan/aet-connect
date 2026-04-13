'use client'

import { useState } from 'react'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

export default function AdminSchoolsPage() {
  const { isAdmin } = useAdminCheck()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [editDialog, setEditDialog] = useState<{ 
    open: boolean
    school?: any
    isCreate?: boolean 
  }>({ open: false })
  
  const [deleteDialog, setDeleteDialog] = useState<{ 
    open: boolean
    schoolId?: string
    schoolName?: string 
  }>({ open: false })
  
  const [formData, setFormData] = useState({
    name_fr: '',
    country: '',
    city: '',
    acronym: '',
    flag: '',
    established_year: 2000,
    description: ''
  })
  
  // Charger écoles
  const { data: schools, isLoading } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: () => apiClient.getAdminSchools(),
    enabled: isAdmin,
  })
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      toast({ title: 'École créée' })
      setEditDialog({ open: false })
      resetForm()
    },
    onError: () => {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  })
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateSchool(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      toast({ title: 'École mise à jour' })
      setEditDialog({ open: false })
      resetForm()
    },
    onError: () => {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      toast({ title: 'École supprimée' })
      setDeleteDialog({ open: false })
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erreur', 
        description: error.response?.data?.error || 'Impossible de supprimer',
        variant: 'destructive' 
      })
    }
  })
  
  const resetForm = () => {
    setFormData({
      name_fr: '',
      country: '',
      city: '',
      acronym: '',
      flag: '',
      established_year: 2000,
      description: ''
    })
  }
  
  const handleEdit = (school: any) => {
    setFormData({
      name_fr: school.name_fr || '',
      country: school.country || '',
      city: school.city || '',
      acronym: school.acronym || '',
      flag: school.flag || '',
      established_year: school.established_year || 2000,
      description: school.description || ''
    })
    setEditDialog({ open: true, school, isCreate: false })
  }
  
  const handleCreate = () => {
    resetForm()
    setEditDialog({ open: true, isCreate: true })
  }
  
  const handleSubmit = () => {
    if (editDialog.isCreate) {
      createMutation.mutate(formData)
    } else if (editDialog.school) {
      updateMutation.mutate({ id: editDialog.school.id, data: formData })
    }
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
        <h1 className="text-3xl font-bold">Gestion des Écoles</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une école
        </Button>
      </div>
      
      {/* Tableau */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Sigle</TableHead>
              <TableHead>Pays</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Année</TableHead>
              <TableHead>Utilisateurs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools && schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Aucune école trouvée
                </TableCell>
              </TableRow>
            ) : (
              schools?.map((school: any) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name_fr}</TableCell>
                  <TableCell>
                    {school.flag && `${school.flag} `}
                    {school.acronym || '—'}
                  </TableCell>
                  <TableCell>{school.country}</TableCell>
                  <TableCell>{school.city}</TableCell>
                  <TableCell>{school.established_year || '—'}</TableCell>
                  <TableCell>{school.user_count || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(school)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialog({
                          open: true,
                          schoolId: school.id,
                          schoolName: school.name_fr
                        })}
                        disabled={(school.user_count || 0) > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog création/édition */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editDialog.isCreate ? 'Ajouter une école' : 'Modifier l\'école'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'école
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom complet *</Label>
                <Input
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  placeholder="Prytanée Militaire de..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Sigle</Label>
                <Input
                  value={formData.acronym}
                  onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                  placeholder="PMK"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Pays *</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Mali"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Ville *</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Kati"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Drapeau</Label>
                <Input
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  placeholder="🇲🇱"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Année de création</Label>
              <Input
                type="number"
                value={formData.established_year}
                onChange={(e) => setFormData({ ...formData, established_year: parseInt(e.target.value) || 2000 })}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Description de l'école..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialog({ open: false })}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !formData.name_fr || !formData.country || !formData.city}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editDialog.isCreate ? 'Création...' : 'Enregistrement...'}
                </>
              ) : (
                editDialog.isCreate ? 'Créer' : 'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog suppression */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteDialog.schoolName}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleteDialog.schoolId && deleteMutation.mutate(deleteDialog.schoolId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
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



