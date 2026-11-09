import { Router } from 'express'
import { usersController } from '@/controllers/users.controller'
import { supabaseAuthMiddleware as authMiddleware } from '@/middleware/supabase-auth.middleware'
import { validateRequest } from '@/middleware/validation.middleware'
import { UpdateProfileSchema, UpdatePrivacySchema, ChangePasswordSchema, RequestDeletionSchema } from '@/utils/validations'
import { supabase } from '@/config/database'
import { listMembers, memberProfile, visibleYears, visibleCities } from '@/services/directory.service'
import { asyncRoute } from '@/utils/http'

const router = Router()

// Toutes les routes users exigent d'être connecté (réseau sur invitation)
router.use(authMiddleware)

// ==================== ANNUAIRE ====================
// Visibilité et masquage : vue directory_entries (voir services/directory.service)

// GET /api/users?search=&school_id=&entry_year=&country=&city=&is_ambassador=&limit=&offset=
router.get('/', asyncRoute(async (req, res) => {
  const q = req.query as Record<string, string | undefined>
  res.json(await listMembers({
    search: q.search,
    school_id: q.school_id,
    entry_year: q.entry_year,
    country: q.country,
    city: q.city,
    is_ambassador: q.is_ambassador === 'true' ? true : q.is_ambassador === 'false' ? false : undefined,
    limit: q.limit ? parseInt(q.limit) : undefined,
    offset: q.offset ? parseInt(q.offset) : undefined
  }))
}))

// GET /api/users/filters/schools
router.get('/filters/schools', asyncRoute(async (_req, res) => {
  const { data, error } = await supabase.from('schools').select('id, name_fr, country').order('name_fr')
  if (error) throw error
  res.json({ schools: data ?? [] })
}))

// GET /api/users/filters/years?school_id=
router.get('/filters/years', asyncRoute(async (req, res) => {
  res.json({ years: await visibleYears(req.query.school_id as string | undefined) })
}))

// GET /api/users/filters/countries (pays des écoles)
router.get('/filters/countries', asyncRoute(async (_req, res) => {
  const { data, error } = await supabase.from('schools').select('country')
  if (error) throw error
  const countries = [...new Set((data ?? []).map((s) => s.country).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'))
  res.json({ countries })
}))

// GET /api/users/filters/cities
router.get('/filters/cities', asyncRoute(async (_req, res) => {
  res.json({ cities: await visibleCities() })
}))

// GET /api/users/me (mon profil complet)
router.get('/me', usersController.getMyProfile.bind(usersController))

// PATCH /api/users/me (modifier mon profil)
router.patch(
  '/me',
  validateRequest(UpdateProfileSchema),
  usersController.updateMyProfile.bind(usersController)
)

// GET /api/users/me/privacy (mes privacy settings)
router.get('/me/privacy', usersController.getMyPrivacy.bind(usersController))

// PATCH /api/users/me/privacy (modifier mes privacy settings)
router.patch(
  '/me/privacy',
  validateRequest(UpdatePrivacySchema),
  usersController.updateMyPrivacy.bind(usersController)
)

// PATCH /api/users/me/password (changer mon mot de passe)
router.patch(
  '/me/password',
  validateRequest(ChangePasswordSchema),
  usersController.changePassword.bind(usersController)
)

// POST /api/users/me/deletion-request (demande de suppression de compte)
router.post(
  '/me/deletion-request',
  validateRequest(RequestDeletionSchema),
  usersController.requestAccountDeletion.bind(usersController)
)

// GET /api/users/:id : profil d'un membre tel que l'annuaire le montre (404 s'il est masqué)
router.get('/:id', asyncRoute(async (req, res) => {
  res.json(await memberProfile(req.params.id))
}))

export default router

