import { Request, Response } from 'express'
import { usersService } from '@/services/users.service'
import { authService } from '@/services/auth.service'
import { logger } from '@/utils/logger'
import { supabase } from '@/config/database'

export class UsersController {
  
  async getUsers(req: Request, res: Response) {
    try {
      const filters = {
        school_id: req.query.school_id as string,
        entry_year: req.query.entry_year as string,
        country: req.query.country as string,
        city: req.query.city as string,
        is_ambassador: req.query.is_ambassador === 'true' ? true : req.query.is_ambassador === 'false' ? false : undefined,
        search: req.query.search as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      }
      
      const result = await usersService.getUsers(filters)
      
      res.json({
        users: result.users,
        total: result.total
      })
    } catch (error: any) {
      logger.error('Error in getUsers:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const user = await usersService.getUserById(id)
      
      res.json(user)
    } catch (error: any) {
      logger.error('Error in getUserById:', error)
      
      if (error.message.includes('non trouvé') || error.message.includes('privé')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
  
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

  async getFilterSchools(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name_fr, country')
        .order('name_fr')

      if (error) throw error

      return res.json({ schools: data || [] })
    } catch (error: any) {
      logger.error('Error fetching schools:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  async getFilterYears(req: Request, res: Response) {
    try {
      const { school_id } = req.query

      let query = supabase
        .from('users')
        .select('entry_year')
        .eq('is_active', true)
        .order('entry_year', { ascending: false })

      if (school_id) {
        query = query.eq('school_id', school_id as string)
      }

      const { data, error } = await query

      if (error) throw error

      // Retourner années uniques
      const uniqueYears = [...new Set((data || []).map(u => u.entry_year))]
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a))

      return res.json({ years: uniqueYears })
    } catch (error: any) {
      logger.error('Error fetching years:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  async getFilterCountries(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('country')
        .order('country')

      if (error) throw error

      // Retourner pays uniques
      const uniqueCountries = [...new Set((data || []).map(s => s.country))]
        .filter(Boolean)
        .sort()

      return res.json({ countries: uniqueCountries })
    } catch (error: any) {
      logger.error('Error fetching countries:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }
}

export const usersController = new UsersController()

