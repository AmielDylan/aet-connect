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

    // Supabase injoignable (réseau, 5xx) : ce n'est pas la session qui est en cause, on peut réessayer
    if (error && (error.name === 'AuthRetryableFetchError' || !error.status || error.status >= 500)) {
      return res.status(503).json({ error: 'Service momentanément indisponible' })
    }
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

    // PGRST116 : aucune ligne (compte inexistant ou désactivé). Toute autre erreur vient de la base ou du réseau :
    // répondre 401 renverrait le membre à la connexion pour une panne passagère ; 503 laisse le client réessayer.
    if (userError && userError.code !== 'PGRST116') {
      return res.status(503).json({ error: 'Service momentanément indisponible' })
    }
    if (!userData) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' })
    }

    // Ajouter l'utilisateur à la requête
    req.user = userData

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(503).json({ error: 'Service momentanément indisponible' })
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
