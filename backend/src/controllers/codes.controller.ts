import { Request, Response } from 'express'
import { codesService } from '@/services/codes.service'
import { logger } from '@/utils/logger'
import { supabase } from '@/config/database'

export class CodesController {
  
  async generateCode(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      // Récupérer user_id depuis le token JWT
      const user_id = req.user.id
      const { school_id, entry_year } = req.body // Optionnel pour admin
      
      const result = await codesService.generateUserCode(user_id, {
        school_id,
        entry_year,
      })
      
      res.status(201).json({
        success: true,
        code: result.code,
        codes_remaining: result.codes_remaining
      })
    } catch (error: any) {
      logger.error('Error in generateCode:', error)
      
      if (error.message.includes('limite')) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }

  async deleteCode(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }

      const { id } = req.params
      const userId = req.user.id

      // Vérifier que le code appartient à l'utilisateur
      const { data: code, error: codeError } = await supabase
        .from('invitation_codes')
        .select('created_by_user_id')
        .eq('id', id)
        .single()

      if (codeError || !code) {
        return res.status(404).json({ error: 'Code non trouvé' })
      }

      if (code.created_by_user_id !== userId) {
        return res.status(403).json({ error: 'Non autorisé' })
      }

      // Supprimer le code
      const { error: deleteError } = await supabase
        .from('invitation_codes')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return res.json({ message: 'Code supprimé avec succès' })
    } catch (error: any) {
      logger.error('Error deleting code:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }
  
  async getMyCodes(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }
      
      // Récupérer user_id depuis le token JWT
      const user_id = req.user.id
      
      const codes = await codesService.getUserCodes(user_id)
      
      res.json({
        codes,
        total: codes.length
      })
    } catch (error: any) {
      logger.error('Error in getMyCodes:', error)
      res.status(500).json({ error: error.message })
    }
  }

  async verifyCode(req: Request, res: Response) {
    try {
      const { code } = req.params

      if (!code) {
        return res.status(400).json({ error: 'Code requis' })
      }

      const codeInfo = await codesService.verifyCode(code)

      res.json(codeInfo)
    } catch (error: any) {
      logger.error('Error in verifyCode:', error)
      
      if (error.message.includes('invalide') || error.message.includes('révoqué') || error.message.includes('utilisé') || error.message.includes('expiré')) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Erreur serveur' })
      }
    }
  }

  async getCodesHistory(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' })
      }

      const userId = req.user.id

      const { data, error } = await supabase
        .from('invitation_codes')
        .select(`
          id,
          code,
          created_at,
          used_at,
          entry_year,
          schools:school_id (
            name_fr
          ),
          users:used_by_user_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('created_by_user_id', userId)
        .not('used_at', 'is', null)
        .order('used_at', { ascending: false })

      if (error) throw error

      const formattedCodes = (data || []).map((code: any) => ({
        id: code.id,
        code: code.code,
        school_name: code.schools?.name_fr || 'Non spécifiée',
        entry_year: code.entry_year,
        created_at: code.created_at,
        used_at: code.used_at,
        used_by: code.users ? {
          id: code.users.id,
          first_name: code.users.first_name,
          last_name: code.users.last_name,
          email: code.users.email,
        } : null,
      }))

      return res.json({ codes: formattedCodes })
    } catch (error: any) {
      logger.error('Error fetching code history:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }
}

export const codesController = new CodesController()

