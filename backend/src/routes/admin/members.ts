import { Router } from 'express'
import { supabase } from '@/config/database'
import { defaultQuota } from '@/invitations'
import { adminService } from '@/services/admin.service'
import { validateRequest } from '@/middleware/validation.middleware'
import { UpdateUserSchema, IncreaseCodeLimitSchema } from '@/utils/validations'
import { asyncRoute, HttpError } from '@/utils/http'
import { plainSearchTerm } from '@/utils/search'
import { logger } from '@/utils/logger'
import { ambassadeurDeLaPromo, nomComplet } from '@/utils/ambassadeurs'
import { toutesLesLignes } from '@/utils/pages'

// Gestion des membres par un admin. Montées sous /api/admin/users.
const router = Router()

const ROLES = ['alumni', 'moderator', 'admin']

async function member(id: string) {
  const { data, error } = await supabase.from('users').select('id, role, is_ambassador, school_id, entry_year').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, 'Membre introuvable')
  return data
}

// GET /api/admin/users?search=&role=&school_id=&is_ambassador=&page=&limit=
// Renvoie aussi, pour la recherche et l'école choisies, le nombre de membres par type (counts),
// et pour chaque membre : l'ambassadeur de sa promo s'il en a un autre, et ses invitations utilisées.
router.get('/', asyncRoute(async (req, res) => {
  const { search, role, school_id, is_ambassador } = req.query as Record<string, string | undefined>
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1') || 1)
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? '50') || 50))

  // Texte nettoyé : sans virgule ni parenthèse, il ne peut pas ajouter de condition au or()
  const term = plainSearchTerm(search)
  const ecole = school_id && school_id !== 'all' ? school_id : null
  const filtrer = <Q extends { or: (f: string) => Q; eq: (c: string, v: unknown) => Q }>(q: Q): Q => {
    if (term) q = q.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`)
    if (ecole) q = q.eq('school_id', ecole)
    return q
  }
  const compter = async (extra?: (q: any) => any) => {
    let q = filtrer(supabase.from('users').select('id', { count: 'exact', head: true }) as any)
    if (extra) q = extra(q)
    const { count, error } = await q
    if (error) throw error
    return count ?? 0
  }

  let query = filtrer(
    supabase
      .from('users')
      .select(
        'id, first_name, last_name, email, role, is_ambassador, max_codes_allowed, current_city, entry_year, school_id, avatar_url, created_at, schools(id, name_fr, acronym, country)',
        { count: 'exact' }
      ) as any
  )
  if (role && role !== 'all') query = query.eq('role', role)
  if (is_ambassador === 'true') query = query.eq('is_ambassador', true)

  const from = (page - 1) * limit
  const [{ data, error, count }, all, alumni, moderator, admin, ambassadors] = await Promise.all([
    query.order('created_at', { ascending: false }).range(from, from + limit - 1),
    compter(),
    compter((q) => q.eq('role', 'alumni')),
    compter((q) => q.eq('role', 'moderator')),
    compter((q) => q.eq('role', 'admin')),
    compter((q) => q.eq('is_ambassador', true)),
  ])
  if (error) throw error
  const membres = (data ?? []) as { id: string; school_id: string | null; entry_year: string | null }[]
  const ids = membres.map((m) => m.id)
  const ecoles = [...new Set(membres.map((m) => m.school_id).filter(Boolean))] as string[]

  const [ambassadeurs, codes] = await Promise.all([
    ecoles.length
      ? supabase.from('users').select('id, first_name, last_name, school_id, entry_year').eq('is_ambassador', true).in('school_id', ecoles)
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? toutesLesLignes<{ created_by_user_id: string; current_uses: number; status: string }>((de, a) =>
          supabase
            .from('invitation_codes')
            .select('created_by_user_id, current_uses, status:invitation_code_status')
            .in('created_by_user_id', ids)
            .order('id')
            .range(de, a))
      : Promise.resolve([]),
  ])
  if (ambassadeurs.error) throw ambassadeurs.error

  // Les invitations qui comptent dans le quota : déjà utilisées, ou encore valables
  const utilisees = new Map<string, number>()
  for (const c of codes) {
    if (c.current_uses > 0 || c.status === 'valid') utilisees.set(c.created_by_user_id, (utilisees.get(c.created_by_user_id) ?? 0) + 1)
  }

  res.json({
    users: membres.map((m) => {
      const amb = (ambassadeurs.data ?? []).find((a) => a.school_id === m.school_id && a.entry_year === m.entry_year && a.id !== m.id)
      return {
        ...m,
        invitations_used: utilisees.get(m.id) ?? 0,
        promo_ambassador: amb ? { first_name: amb.first_name, last_name: amb.last_name } : null,
      }
    }),
    counts: { all, alumni, moderator, admin, ambassadors },
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) }
  })
}))

// PATCH /api/admin/users/:id
router.patch('/:id', validateRequest(UpdateUserSchema), asyncRoute(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body)
  logger.info('User updated by admin:', { user_id: req.params.id, admin_id: req.user.id })
  res.json({ success: true, user })
}))

// PATCH /api/admin/users/:id/increase-code-limit { new_limit }
router.patch('/:id/increase-code-limit', validateRequest(IncreaseCodeLimitSchema), asyncRoute(async (req, res) => {
  const user = await adminService.increaseCodeLimit(req.params.id, req.body)
  logger.info('Code limit increased:', { user_id: req.params.id, new_limit: req.body.new_limit })
  res.json({ success: true, user, message: `Limite augmentée à ${req.body.new_limit} codes` })
}))

// PATCH /api/admin/users/:id/role { role } : le quota suit le nouveau rôle
router.patch('/:id/role', asyncRoute(async (req, res) => {
  const { role } = req.body
  if (!ROLES.includes(role)) throw new HttpError(400, 'Rôle invalide')
  if (req.params.id === req.user.id && role !== 'admin') {
    throw new HttpError(403, 'Vous ne pouvez pas retirer vos propres droits administrateur')
  }

  const target = await member(req.params.id)
  // Admin : illimité (stocké 999)
  const max_codes_allowed = defaultQuota({ role, isAmbassador: !!target.is_ambassador }) ?? 999

  const { data, error } = await supabase
    .from('users').update({ role, max_codes_allowed }).eq('id', target.id).select().single()
  if (error) throw error
  res.json(data)
}))

// PATCH /api/admin/users/:id/ambassador { is_ambassador } : le quota suit le statut
router.patch('/:id/ambassador', asyncRoute(async (req, res) => {
  const is_ambassador = req.body.is_ambassador === true
  const target = await member(req.params.id)
  if (is_ambassador && target.school_id && target.entry_year) {
    const deja = await ambassadeurDeLaPromo(supabase, { schoolId: target.school_id, entryYear: target.entry_year }, target.id)
    if (deja) throw new HttpError(409, `${nomComplet(deja)} représente déjà cette promo.`)
  }
  const max_codes_allowed = defaultQuota({ role: target.role, isAmbassador: is_ambassador }) ?? 999

  const { data, error } = await supabase
    .from('users').update({ is_ambassador, max_codes_allowed }).eq('id', target.id).select().single()
  // 23505 : un autre admin vient de nommer l'ambassadeur de cette promo (index unique)
  if (error?.code === '23505') throw new HttpError(409, 'Cette promo a déjà un ambassadeur.')
  if (error) throw error
  res.json(data)
}))

// DELETE /api/admin/users/:id : supprimer le compte suffit, la base fait le reste
// (fiche supprimée, codes encore valables révoqués : migration member_lifecycle)
router.delete('/:id', asyncRoute(async (req, res) => {
  if (req.params.id === req.user.id) throw new HttpError(403, 'Vous ne pouvez pas supprimer votre propre compte')
  const target = await member(req.params.id)
  if (target.role === 'admin') {
    throw new HttpError(403, "Impossible de supprimer un administrateur. Retirez-lui d'abord les droits admin.")
  }

  const { error } = await supabase.auth.admin.deleteUser(target.id)
  if (error && error.message !== 'User not found') throw error
  res.json({ success: true })
}))

export default router
