import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { ZodError } from 'zod'
import { HttpError } from '@/utils/http'
import { InvitationError, sendInvitationError } from '@/invitations'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Refus attendus : pas de journal d'erreur, le statut dit tout
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message })
  }
  if (err instanceof InvitationError) {
    return sendInvitationError(res, err, `${req.method} ${req.path}`)
  }

  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors
    })
  }

  res.status(500).json({
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
}

export function notFoundHandler(req: Request, res: Response) {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`)
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  })
}
