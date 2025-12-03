import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/database.js'

// Étendre le type Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: any // Type complet de l'utilisateur depuis la table users
    }
  }
}

/**
 * Middleware pour vérifier le token Supabase Auth
 * Remplace l'ancien authMiddleware JWT custom
 */
export async function supabaseAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' })
    }

    const token = authHeader.split(' ')[1]

    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Token invalide ou expiré' })
    }

    // Récupérer les données complètes de l'utilisateur depuis la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' })
    }

    // Ajouter l'utilisateur à la requête
    req.user = userData

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Erreur d\'authentification' })
  }
}

/**
 * Middleware pour vérifier le rôle admin
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès interdit',
      message: 'Vous devez être administrateur'
    })
  }
  
  next()
}

/**
 * Middleware pour vérifier le rôle moderator ou admin
 */
export function moderatorMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  
  if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès interdit',
      message: 'Vous devez être modérateur ou administrateur'
    })
  }
  
  next()
}

