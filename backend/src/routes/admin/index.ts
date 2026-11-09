import { Router } from 'express'
import { supabaseAuthMiddleware, adminMiddleware } from '@/middleware/supabase-auth.middleware'
import { adminService } from '@/services/admin.service'
import { asyncRoute } from '@/utils/http'
import accessRequests from './access-requests'
import deletionRequests from './deletion-requests'
import members from './members'
import schools from './schools'
import events from './events'

// /api/admin : un fichier par sujet. Toutes les routes exigent un compte admin.
const router = Router()

router.use(supabaseAuthMiddleware, adminMiddleware)

// GET /api/admin/stats
router.get('/stats', asyncRoute(async (_req, res) => {
  res.json(await adminService.getStats())
}))

router.use('/access-requests', accessRequests)
router.use('/deletion-requests', deletionRequests)
router.use('/users', members)
router.use('/schools', schools)
router.use('/events', events)

export default router
