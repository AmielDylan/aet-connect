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

  async getFilterCities(req: Request, res: Response) {
    try {
      // Récupérer toutes les villes distinctes des utilisateurs actifs
      // qui ont autorisé la visibilité de leur localisation
      // Utiliser une requête SQL directe pour meilleure performance
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          current_city,
          user_privacy_settings!inner (
            show_current_location
          )
        `)
        .eq('is_active', true)
        .not('current_city', 'is', null)
        .neq('current_city', '')

      if (error) throw error

      // Filtrer uniquement les utilisateurs avec show_current_location: true
      // Note: Supabase ne permet pas facilement de filtrer directement sur une relation imbriquée
      // donc on filtre après le fetch
      const citiesWithPrivacy = (users || []).filter((u: any) => {
        const privacy = Array.isArray(u.user_privacy_settings) 
          ? u.user_privacy_settings[0] 
          : u.user_privacy_settings
        return privacy?.show_current_location === true
      })

      // Extraire les villes uniques et les trier
      const uniqueCities = [...new Set(citiesWithPrivacy.map((u: any) => u.current_city))]
        .filter(Boolean)
        .sort()

      return res.json({ cities: uniqueCities })
    } catch (error: any) {
      logger.error('Error fetching cities:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }
}

export const usersController = new UsersController()

