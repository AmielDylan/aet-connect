import { Router } from 'express'
import { supabaseAuthMiddleware } from '../middleware/supabase-auth.middleware.js'
import { supabase } from '../config/database.js'

const router = Router()

/**
 * GET /api/auth/me
 * Récupère l'utilisateur authentifié
 */
router.get('/me', supabaseAuthMiddleware, async (req, res) => {
  try {
    // L'utilisateur est déjà dans req.user grâce au middleware
    const user = req.user

    if (!user) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    // Récupérer l'école si présente
    const { data: userWithSchool } = await supabase
      .from('users')
      .select(`
        *,
        schools:school_id (
          id,
          name_fr,
          name_en,
          country,
          established_year
        )
      `)
      .eq('id', user.id)
      .single()

    res.json(userWithSchool || user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * POST /api/auth/logout
 * Déconnexion (juste pour compatibilité, Supabase gère ça côté client)
 */
router.post('/logout', (req, res) => {
  // Avec Supabase Auth, le logout se fait côté client
  // Cette route existe juste pour compatibilité
  res.json({ message: 'Déconnexion réussie' })
})

export default router
