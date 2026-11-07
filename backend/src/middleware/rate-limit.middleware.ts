import rateLimit from 'express-rate-limit'

/**
 * Routes publiques qui manipulent des codes d'invitation : empêche de balayer
 * les codes par essais successifs.
 */
export const invitationCodeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans une minute.' }
})
