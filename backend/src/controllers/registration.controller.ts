import { Request, Response } from 'express'
import { registrationService } from '@/services/registration.service'
import { logger } from '@/utils/logger'
import { invitations, InvitationError, sendInvitationError, type CheckResult } from '@/invitations'

/** Forme de réponse attendue par le frontend (VerifyInvitationCodeResponse). */
export function toVerifyResponse(result: CheckResult) {
  if (!result.valid) {
    const messages = {
      unknown: 'Code invalide ou inexistant. Vérifiez le code reçu.',
      revoked: 'Ce code a été révoqué. Demandez-en un nouveau.',
      expired: 'Ce code a expiré. Demandez-en un nouveau.',
      exhausted: 'Ce code a déjà été utilisé.'
    }
    return { valid: false, reason: result.reason, message: messages[result.reason] }
  }
  return {
    valid: true,
    code: result.code,
    message: 'Code valide',
    universal: result.promo === null,
    school_id: result.promo?.schoolId ?? null,
    entry_year: result.promo?.entryYear ?? null,
    school_name: result.schoolName,
    grants_ambassador: result.grantsAmbassador
  }
}

export class RegistrationController {
  
  async checkSchoolPromo(req: Request, res: Response) {
    try {
      const { school_id, entry_year } = req.body
      
      const result = await registrationService.checkSchoolPromo(school_id, entry_year)
      
      res.json(result)
    } catch (error: any) {
      logger.error('Error in checkSchoolPromo:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async requestInitialAccess(req: Request, res: Response) {
    try {
      const data = req.body
      
      const request = await registrationService.createAccessRequest(data)
      
      // TODO: Envoyer email à l'admin
      
      res.status(201).json({
        success: true,
        request_id: request.id,
        message: 'Votre demande a été envoyée à l\'équipe AET Connect'
      })
    } catch (error: any) {
      logger.error('Error in requestInitialAccess:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  async verifyInvitationCode(req: Request, res: Response) {
    try {
      const result = await invitations.check(req.body.code)
      res.json(toVerifyResponse(result))
    } catch (error) {
      sendInvitationError(res, error, 'verifyInvitationCode')
    }
  }

  async completeRegistration(req: Request, res: Response) {
    try {
      const { invitation_code, first_name, last_name, email, password, school_id, entry_year } = req.body
      const choice = school_id && entry_year ? { promo: { schoolId: school_id, entryYear: entry_year } } : {}

      const { memberId } = await invitations.redeem(invitation_code, choice, (grant) =>
        registrationService.createMemberAccount(grant, { first_name, last_name, email, password })
      )

      res.status(201).json({ success: true, user_id: memberId, message: 'Inscription réussie' })
    } catch (error: any) {
      if (error instanceof InvitationError) return sendInvitationError(res, error, 'completeRegistration')
      logger.error('Error in completeRegistration:', error)
      // Erreurs de création de compte (email déjà utilisé…) : le code a été rendu par le module
      res.status(400).json({ error: error.message || "Erreur lors de l'inscription" })
    }
  }

  async requestCodeFromPeer(req: Request, res: Response) {
    try {
      const data = req.body
      
      const request = await registrationService.requestCodeFromPeer(data)

      res.status(201).json({
        success: true,
        request_id: request.id,
        message: 'Votre demande a été transmise à l’équipe AET Connect'
      })
    } catch (error: any) {
      logger.error('Error in requestCodeFromPeer:', error)
      // Email déjà inscrit ou demande déjà en attente : conflit, pas une panne
      res.status(/déjà/.test(error.message) ? 409 : 500).json({ error: error.message })
    }
  }
}

export const registrationController = new RegistrationController()

