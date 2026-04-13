import { Router } from 'express'
import { usersController } from '@/controllers/users.controller'
import { supabaseAuthMiddleware as authMiddleware } from '@/middleware/supabase-auth.middleware'
import { validateRequest } from '@/middleware/validation.middleware'
import { UpdateProfileSchema, UpdatePrivacySchema, ChangePasswordSchema, RequestDeletionSchema } from '@/utils/validations'
import { supabase } from '@/config/database'

const router = Router()

// Routes publiques (sans authentification)
// GET /api/users/filters/schools - Liste des écoles avec membres (PUBLIC)
router.get('/filters/schools', usersController.getFilterSchools.bind(usersController))

// GET /api/users/filters/years - Liste des promotions (PUBLIC)
router.get('/filters/years', usersController.getFilterYears.bind(usersController))

// GET /api/users/filters/countries - Liste des pays (PUBLIC)
router.get('/filters/countries', usersController.getFilterCountries.bind(usersController))

// GET /api/users/filters/cities - Liste des villes (PUBLIC)
router.get('/filters/cities', usersController.getFilterCities.bind(usersController))

// GET /api/users/profile/:id - Profil public (PAS d'authentification requise)
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        school_id,
        entry_year,
        current_city,
        current_country,
        bio,
        linkedin_url,
        avatar_url,
        is_ambassador,
        schools(
          id,
          name_fr,
          acronym,
          flag,
          country
        ),
        user_privacy_settings(
          show_email,
          show_phone,
          show_current_location,
          show_bio,
          show_linkedin,
          show_entry_year
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()
    
    if (error || !user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    
    // Appliquer les privacy settings
    const privacy = Array.isArray(user.user_privacy_settings) 
      ? user.user_privacy_settings[0] 
      : user.user_privacy_settings || {}
    
    const school = Array.isArray(user.schools) ? user.schools[0] : user.schools
    
    const publicProfile = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: privacy.show_email !== false ? user.email : null,
      phone: privacy.show_phone !== false ? user.phone : null,
      entry_year: privacy.show_entry_year !== false ? user.entry_year : null,
      current_city: privacy.show_current_location !== false ? user.current_city : null,
      current_country: privacy.show_current_location !== false ? user.current_country : null,
      bio: privacy.show_bio !== false ? user.bio : null,
      linkedin_url: privacy.show_linkedin !== false ? user.linkedin_url : null,
      avatar_url: user.avatar_url,
      is_ambassador: user.is_ambassador,
      schools: school,
      privacy
    }
    
    return res.json(publicProfile)
  } catch (error) {
    console.error('Error fetching public profile:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// TOUTES les autres routes users requièrent authentification
router.use(authMiddleware)

// GET /api/users (annuaire)
router.get('/', usersController.getUsers.bind(usersController))

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

// GET /api/users/:id (profil public)
router.get('/:id', usersController.getUserById.bind(usersController))

export default router

