import { Router } from 'express'
import { usersController } from '@/controllers/users.controller'
import { supabaseAuthMiddleware as authMiddleware } from '@/middleware/supabase-auth.middleware'
import { validateRequest } from '@/middleware/validation.middleware'
import { UpdateProfileSchema, UpdatePrivacySchema, ChangePasswordSchema } from '@/utils/validations'

const router = Router()

// TOUTES les routes users requièrent authentification
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

// GET /api/users/:id (profil public)
router.get('/:id', usersController.getUserById.bind(usersController))

export default router

