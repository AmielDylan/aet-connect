import { Router } from 'express'
import { supabase } from '@/config/database'
import { asyncRoute, HttpError } from '@/utils/http'

// Gestion des écoles par un admin.
const router = Router()

const editable = (body: Record<string, unknown>) => {
  const { name_fr, country, city, acronym, flag, established_year, description } = body
  return { name_fr, country, city, acronym, flag, established_year, description }
}

// GET /api/admin/schools : avec le nombre de membres de chaque école
router.get('/', asyncRoute(async (_req, res) => {
  const { data, error } = await supabase
    .from('schools')
    .select('*, members:users(count)')
    .order('country', { ascending: true })
    .order('name_fr', { ascending: true })
  if (error) throw error

  res.json((data ?? []).map(({ members, ...school }: any) => ({ ...school, user_count: members?.[0]?.count ?? 0 })))
}))

// POST /api/admin/schools
router.post('/', asyncRoute(async (req, res) => {
  const { data, error } = await supabase.from('schools').insert(editable(req.body)).select().single()
  if (error) throw error
  res.json(data)
}))

// PATCH /api/admin/schools/:id
router.patch('/:id', asyncRoute(async (req, res) => {
  const { data, error } = await supabase.from('schools').update(editable(req.body)).eq('id', req.params.id).select().single()
  if (error) throw error
  res.json(data)
}))

// DELETE /api/admin/schools/:id : refusé tant que des membres y sont rattachés
router.delete('/:id', asyncRoute(async (req, res) => {
  const { count, error: countError } = await supabase
    .from('users').select('*', { count: 'exact', head: true }).eq('school_id', req.params.id)
  if (countError) throw countError
  if (count && count > 0) {
    throw new HttpError(400, `Impossible de supprimer : ${count} utilisateur(s) sont rattachés à cette école`)
  }

  const { error } = await supabase.from('schools').delete().eq('id', req.params.id)
  if (error) throw error
  res.json({ success: true })
}))

export default router
