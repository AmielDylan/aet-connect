import { Request, Response } from 'express'
import { usersService } from '@/services/users.service'
import { authService } from '@/services/auth.service'
import { logger } from '@/utils/logger'
import { supabase } from '@/config/database'

export class UsersController {
  
  
  
  async getMyProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const profile = await usersService.getMyProfile(req.user.id)
      
      res.json(profile)
    } catch (error: any) {
      logger.error('Error in getMyProfile:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async updateMyProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const data = req.body
      const profile = await usersService.updateMyProfile(req.user.id, data)
      
      logger.info('User profile updated:', { user_id: req.user.id })
      
      res.json({
        success: true,
        user: profile
      })
    } catch (error: any) {
      logger.error('Error in updateMyProfile:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async getMyPrivacy(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const privacy = await usersService.getMyPrivacy(req.user.id)
      
      res.json(privacy)
    } catch (error: any) {
      logger.error('Error in getMyPrivacy:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async updateMyPrivacy(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      const data = req.body
      const privacy = await usersService.updateMyPrivacy(req.user.id, data)
      
      logger.info('User privacy updated:', { user_id: req.user.id })
      
      res.json({
        success: true,
        privacy,
        message: 'Paramètres de confidentialité mis à jour'
      })
    } catch (error: any) {
      logger.error('Error in updateMyPrivacy:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Change le mot de passe de l'utilisateur connecté
   */
  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }

      const { old_password, new_password } = req.body

      if (!old_password || !new_password) {
        return res.status(400).json({ 
          error: 'Ancien et nouveau mot de passe requis' 
        })
      }

      const result = await authService.changePassword(
        req.user.id,
        old_password,
        new_password
      )

      logger.info('User password changed:', { user_id: req.user.id })

      res.json(result)
    } catch (error: any) {
      logger.error('Error in changePassword:', error)
      const message = error instanceof Error ? error.message : 'Erreur serveur'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Crée une demande de suppression de compte pour l'utilisateur connecté
   */
  async requestAccountDeletion(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }

      const { reason } = req.body

      // Vérifier qu'il n'y a pas déjà une demande en attente
      const { data: existing } = await supabase
        .from('deletion_requests')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('status', 'pending')
        .maybeSingle()

      if (existing) {
        return res.status(409).json({
          error: 'Une demande de suppression est déjà en cours de traitement',
        })
      }

      const { error: insertError } = await supabase
        .from('deletion_requests')
        .insert({
          user_id: req.user.id,
          reason: reason || null,
          status: 'pending',
        })

      if (insertError) throw insertError

      logger.info('Account deletion requested:', { user_id: req.user.id })

      return res.json({
        success: true,
        message:
          'Votre demande de suppression a été transmise aux administrateurs.',
      })
    } catch (error: any) {
      logger.error('Error in requestAccountDeletion:', error)
      return res.status(500).json({ error: error.message })
    }
  }




}

export const usersController = new UsersController()

