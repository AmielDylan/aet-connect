import { Router } from 'express'
import { dashboardService } from '../services/dashboard.service.js'
import { supabaseAuthMiddleware as authMiddleware } from '../middleware/supabase-auth.middleware.js'

const router = Router()

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware)

/**
 * GET /api/dashboard/stats
 * Récupère les statistiques du dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const stats = await dashboardService.getDashboardStats(userId)
    res.json(stats)
  } catch (error) {
    console.error('Error in /dashboard/stats:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * GET /api/dashboard/recent
 * Récupère les nouveaux membres de ma promotion
 */
router.get('/recent', async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const recentMembers = await dashboardService.getRecentMembers(userId)
    res.json(recentMembers)
  } catch (error) {
    console.error('Error in /dashboard/recent:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router

