import { Request, Response } from 'express'
import { codesService } from '@/services/codes.service'
import { logger } from '@/utils/logger'
import { invitations, sendInvitationError, type IssueOptions } from '@/invitations'
import { toVerifyResponse } from '@/controllers/registration.controller'
import { supabase } from '@/config/database'

export class CodesController {
  
  // POST /api/codes/generate
  // Membre : sa promo, un usage. Admin : school_id + entry_year, ou universal, et max_uses.
  async generateCode(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' })
      const { school_id, entry_year, universal, max_uses } = req.body ?? {}
      const options: IssueOptions = {}
      if (universal) options.promo = 'universal'
      else if (school_id && entry_year) options.promo = { schoolId: school_id, entryYear: entry_year }
      if (max_uses !== undefined) options.maxUses = Number(max_uses)

      const issued = await invitations.issue(req.user.id, options)
      const quota = await invitations.quota(req.user.id)

      res.status(201).json({
        success: true,
        code: issued.code,
        expires_at: issued.expiresAt.toISOString(),
        codes_remaining: quota.remaining
      })
    } catch (error) {
      sendInvitationError(res, error, 'generateCode')
    }
  }

  // DELETE /api/codes/:id : révoque un code non utilisé (il rend sa place dans le quota)
  async deleteCode(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' })
      await invitations.revoke(req.user.id, req.params.id)
      return res.json({ message: 'Code révoqué' })
    } catch (error) {
      sendInvitationError(res, error, 'deleteCode')
    }
  }

  // GET /api/codes/my-codes : codes émis + quota
  async getMyCodes(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' })
      const [codes, quota] = await Promise.all([
        codesService.getUserCodes(req.user.id),
        invitations.quota(req.user.id)
      ])
      res.json({ codes, total: codes.length, quota })
    } catch (error) {
      sendInvitationError(res, error, 'getMyCodes')
    }
  }

  // GET /api/codes/verify/:code (public, limité en débit)
  async verifyCode(req: Request, res: Response) {
    try {
      const result = toVerifyResponse(await invitations.check(req.params.code ?? ''))
      if (!result.valid) return res.status(400).json({ error: result.message, reason: result.reason })
      res.json(result)
    } catch (error) {
      sendInvitationError(res, error, 'verifyCode')
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

