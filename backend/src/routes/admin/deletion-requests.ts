import { Router } from 'express'
import { supabase } from '@/config/database'
import { asyncRoute, HttpError } from '@/utils/http'

// Demandes de suppression de compte, faites par les membres eux-mêmes.
// Une demande approuvée reste comme trace (requester_email / requester_name).
const router = Router()

// GET /api/admin/deletion-requests?status=pending|approved|rejected|all
router.get('/', asyncRoute(async (req, res) => {
  const status = (req.query.status as string) ?? 'pending'
  let query = supabase
    .from('deletion_requests')
    .select(`
      *,
      users!deletion_requests_user_id_fkey(
        id, first_name, last_name, email, role, entry_year, created_at,
        schools(id, name_fr, acronym, country)
      )
    `)
    .order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  res.json(data ?? [])
}))

async function pendingRequest(id: string) {
  const { data, error } = await supabase.from('deletion_requests').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, 'Demande introuvable')
  if (data.status !== 'pending') throw new HttpError(409, 'Cette demande a déjà été traitée')
  return data
}

// POST /api/admin/deletion-requests/:id/approve : supprime le compte
router.post('/:id/approve', asyncRoute(async (req, res) => {
  const request = await pendingRequest(req.params.id)

  const { data: target } = await supabase.from('users').select('role').eq('id', request.user_id).maybeSingle()
  if (target?.role === 'admin') {
    throw new HttpError(403, "Impossible de supprimer un administrateur via ce flux. Retirez-lui d'abord le rôle admin.")
  }

  // Le compte d'abord : la base supprime la fiche, révoque les codes encore valables
  // et garde la demande (migration member_lifecycle).
  const { error: authError } = await supabase.auth.admin.deleteUser(request.user_id)
  if (authError && authError.message !== 'User not found') throw authError

  const { error } = await supabase
    .from('deletion_requests')
    .update({ status: 'approved', processed_at: new Date().toISOString(), processed_by_admin_id: req.user.id })
    .eq('id', request.id)
  if (error) throw error

  res.json({ success: true, message: 'Compte supprimé avec succès' })
}))

// POST /api/admin/deletion-requests/:id/reject : le compte est conservé
router.post('/:id/reject', asyncRoute(async (req, res) => {
  const { data, error } = await supabase
    .from('deletion_requests')
    .update({ status: 'rejected', processed_at: new Date().toISOString(), processed_by_admin_id: req.user.id })
    .eq('id', req.params.id)
    .eq('status', 'pending')
    .select('id')
  if (error) throw error
  if (!data?.length) throw new HttpError(409, 'Demande introuvable ou déjà traitée')
  res.json({ success: true, message: 'Demande rejetée, compte conservé' })
}))

export default router
