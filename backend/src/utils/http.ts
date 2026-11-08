import type { Request, Response, NextFunction, RequestHandler } from 'express'

/** Refus attendu (404, 409…) : le middleware d'erreurs renvoie ce statut et ce message. */
export class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
    this.name = 'HttpError'
  }
}

/** Route async sans try/catch : toute erreur part vers le middleware d'erreurs. */
export function asyncRoute(handler: (req: Request, res: Response) => Promise<unknown>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next)
  }
}
