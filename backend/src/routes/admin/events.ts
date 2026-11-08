import { Router } from 'express'
import { adminService } from '@/services/admin.service'
import { validateRequest } from '@/middleware/validation.middleware'
import { UpdateEventSchema } from '@/utils/validations'
import { asyncRoute } from '@/utils/http'
import { logger } from '@/utils/logger'

// Événements vus par un admin : tous, quel que soit leur créateur.
const router = Router()

// GET /api/admin/events?limit=&offset=&is_active=…
router.get('/', asyncRoute(async (req, res) => {
  const q = req.query
  const events = await adminService.getAllEvents({
    ...q,
    limit: q.limit ? parseInt(q.limit as string) : undefined,
    offset: q.offset ? parseInt(q.offset as string) : undefined,
    is_active: q.is_active === 'true' ? true : q.is_active === 'false' ? false : undefined
  })
  const list = Array.isArray(events) ? events : []
  res.json({ events: list, total: list.length })
}))

// GET /api/admin/events/:id/participants
router.get('/:id/participants', asyncRoute(async (req, res) => {
  const participants = await adminService.getEventParticipantsAdmin(req.params.id)
  const list = Array.isArray(participants) ? participants : []
  res.json({ participants: list, total: list.length })
}))

// PATCH /api/admin/events/:id
router.patch('/:id', validateRequest(UpdateEventSchema), asyncRoute(async (req, res) => {
  const event = await adminService.updateAnyEvent(req.params.id, req.body)
  logger.info('Event updated by admin:', { event_id: req.params.id, admin_id: req.user.id })
  res.json({ success: true, event })
}))

// DELETE /api/admin/events/:id
router.delete('/:id', asyncRoute(async (req, res) => {
  const result = await adminService.deleteAnyEvent(req.params.id)
  logger.info('Event deleted by admin:', { event_id: req.params.id, admin_id: req.user.id })
  res.json(result)
}))

export default router
