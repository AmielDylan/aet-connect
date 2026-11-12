import type { Response } from 'express'
import { InvitationError, type InvitationErrorReason } from './invitations'
import { logger } from '@/utils/logger'

const STATUS: Record<InvitationErrorReason, number> = {
  unknown: 400,
  revoked: 400,
  expired: 400,
  exhausted: 400,
  promo_required: 400,
  quota_reached: 403,
  not_allowed: 403,
  not_owner: 403,
  already_used: 409,
  request_not_pending: 409,
  promo_has_ambassador: 409
}

/** Traduit une erreur du module en réponse HTTP ; toute autre erreur devient un 500. */
export function sendInvitationError(res: Response, error: unknown, context: string) {
  if (error instanceof InvitationError) {
    return res.status(STATUS[error.reason]).json({ error: error.message, reason: error.reason })
  }
  logger.error(`Error in ${context}:`, error)
  return res.status(500).json({ error: 'Erreur serveur' })
}
