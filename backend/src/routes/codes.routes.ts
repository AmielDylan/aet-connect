import { Router } from 'express'
import { codesController } from '@/controllers/codes.controller'
import { supabaseAuthMiddleware as authMiddleware } from '@/middleware/supabase-auth.middleware'

const router = Router()

// POST /api/codes/generate (authentification requise)
router.post(
  '/generate',
  authMiddleware,
  codesController.generateCode.bind(codesController)
)

// GET /api/codes/my-codes (authentification requise)
router.get(
  '/my-codes',
  authMiddleware,
  codesController.getMyCodes.bind(codesController)
)

// GET /api/codes/verify/:code (pas d'authentification requise)
router.get(
  '/verify/:code',
  codesController.verifyCode.bind(codesController)
)

// DELETE /api/codes/:id - Supprimer un code
router.delete(
  '/:id',
  authMiddleware,
  codesController.deleteCode.bind(codesController)
)

// GET /api/codes/history - Historique des codes utilisés
router.get(
  '/history',
  authMiddleware,
  codesController.getCodesHistory.bind(codesController)
)

export default router

