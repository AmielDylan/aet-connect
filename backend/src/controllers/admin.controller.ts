import { Request, Response } from 'express'
import { adminService } from '@/services/admin.service'
import { logger } from '@/utils/logger'

export class AdminController {
  
  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getStats()
      
      res.json(stats)
    } catch (error: any) {
      logger.error('Error in getStats:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  
  
  
  
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      
      const user = await adminService.updateUser(id, data)
      
      logger.info('User updated by admin:', { user_id: id, admin_id: req.user?.id })
      
      res.json({
        success: true,
        user
      })
    } catch (error: any) {
      logger.error('Error in updateUser:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  
  async increaseCodeLimit(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      
      const user = await adminService.increaseCodeLimit(id, data)
      
      logger.info('Code limit increased:', { user_id: id, new_limit: data.new_limit })
      
      res.json({
        success: true,
        user,
        message: `Limite augmentée à ${data.new_limit} codes`
      })
    } catch (error: any) {
      logger.error('Error in increaseCodeLimit:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GESTION ÉVÉNEMENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  async getAllEvents(req: Request, res: Response) {
    try {
      const filters: any = {
        ...req.query,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined
      }
      
      const events = await adminService.getAllEvents(filters)
      
      const eventsArray = Array.isArray(events) ? events : []
      res.json({
        events: eventsArray,
        total: eventsArray.length
      })
    } catch (error: any) {
      logger.error('Error in getAllEvents:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async updateAnyEvent(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      
      const event = await adminService.updateAnyEvent(id, data)
      
      logger.info('Event updated by admin:', { event_id: id, admin_id: req.user?.id })
      
      res.json({
        success: true,
        event
      })
    } catch (error: any) {
      logger.error('Error in updateAnyEvent:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async deleteAnyEvent(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const result = await adminService.deleteAnyEvent(id)
      
      logger.info('Event deleted by admin:', { event_id: id, admin_id: req.user?.id })
      
      res.json(result)
    } catch (error: any) {
      logger.error('Error in deleteAnyEvent:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async getEventParticipantsAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const participants = await adminService.getEventParticipantsAdmin(id)
      
      const participantsArray = Array.isArray(participants) ? participants : []
      res.json({
        participants: participantsArray,
        total: participantsArray.length
      })
    } catch (error: any) {
      logger.error('Error in getEventParticipantsAdmin:', error)
      res.status(500).json({ error: error.message })
    }
  }
}

export const adminController = new AdminController()

