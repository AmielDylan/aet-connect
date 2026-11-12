import { Router } from 'express'
import { supabase } from '@/config/database'
import { z } from 'zod'
import { asyncRoute, HttpError } from '@/utils/http'
import { toutesLesLignes } from '@/utils/pages'

// Gestion des écoles par un admin.
const router = Router()

// Les champs qu'un admin peut écrire. Texte nettoyé ; sigle et description vides deviennent null
// (sans sigle, l'école n'apparaît pas sur le site public).
const texte = (max: number) => z.string().trim().max(max)
const optionnel = (max: number) => texte(max).transform((v) => v || null).nullable().optional()
const Ecole = z.object({
  name_fr: texte(200).min(3, 'Il manque le nom complet de l’école.'),
  city: texte(100).min(1, 'Il manque la ville.'),
  country: texte(100).min(1, 'Il manque le pays.'),
  acronym: optionnel(10),
  established_year: z.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
  description: optionnel(1000),
})

function editable(body: unknown, partiel: boolean) {
  const r = (partiel ? Ecole.partial() : Ecole).safeParse(body)
  if (!r.success) throw new HttpError(400, r.error.issues[0]?.message ?? 'Champs invalides')
  return r.data
}

// GET /api/admin/schools : avec le nombre de membres de chaque école
router.get('/', asyncRoute(async (_req, res) => {
  // Toutes les écoles, par lots : une requête n'en renvoie que 1 000
  const ecoles = await toutesLesLignes<Record<string, unknown> & { members: { count: number }[] | null }>((de, a) =>
    supabase
      .from('schools')
      .select('*, members:users(count)')
      .order('country', { ascending: true })
      .order('name_fr', { ascending: true })
      .order('id', { ascending: true })
      .range(de, a))

  res.json(ecoles.map(({ members, ...school }) => ({ ...school, user_count: members?.[0]?.count ?? 0 })))
}))

// POST /api/admin/schools
router.post('/', asyncRoute(async (req, res) => {
  const { data, error } = await supabase.from('schools').insert(editable(req.body, false)).select().single()
  if (error) throw error
  res.json(data)
}))

// PATCH /api/admin/schools/:id
router.patch('/:id', asyncRoute(async (req, res) => {
  const { data, error } = await supabase.from('schools').update(editable(req.body, true)).eq('id', req.params.id).select().single()
  if (error) throw error
  res.json(data)
}))

// DELETE /api/admin/schools/:id : refusé tant que des membres y sont rattachés
router.delete('/:id', asyncRoute(async (req, res) => {
  const { count, error: countError } = await supabase
    .from('users').select('*', { count: 'exact', head: true }).eq('school_id', req.params.id)
  if (countError) throw countError
  if (count && count > 0) {
    throw new HttpError(400, `${count} ${count > 1 ? 'membres y sont rattachés' : 'membre y est rattaché'} : l’école ne peut pas être supprimée.`)
  }

  const { error } = await supabase.from('schools').delete().eq('id', req.params.id)
  if (error) throw error
  res.json({ success: true })
}))

export default router
