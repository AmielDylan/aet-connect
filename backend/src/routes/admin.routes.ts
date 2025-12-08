import { Router } from 'express'
import { adminController } from '@/controllers/admin.controller'
import { supabaseAuthMiddleware as authMiddleware, adminMiddleware } from '@/middleware/supabase-auth.middleware'
import { validateRequest } from '@/middleware/validation.middleware'
import { 
  UpdateUserSchema, 
  IncreaseCodeLimitSchema, 
  SetAmbassadorSchema,
  AccessRequestFiltersSchema,
  UserFiltersSchema,
  UpdateEventSchema
} from '@/utils/validations'
import { supabase } from '@/config/database'
import { createClient } from '@supabase/supabase-js'
import { config } from '@/config/environment'

const router = Router()

// Toutes les routes admin requièrent authentification + rôle admin
router.use(authMiddleware, adminMiddleware)

// Client Supabase Admin pour supprimer les utilisateurs auth
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET /api/admin/stats
router.get('/stats', adminController.getStats.bind(adminController))

// ==================== DEMANDES D'ACCÈS ====================

// GET /api/admin/access-requests - Liste des demandes
router.get('/access-requests', async (req, res) => {
  try {
    const { status = 'pending' } = req.query
    
    let query = supabase
      .from('access_requests')
      .select(`
        *,
        schools!left(id, name_fr, acronym, country)
      `)
      .order('created_at', { ascending: false })
    
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return res.json(data || [])
  } catch (error) {
    console.error('Error fetching access requests:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/admin/access-requests/:id/approve - Approuver
router.post('/access-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    const adminUser = req.user
    
    // Récupérer la demande
    const { data: request, error: fetchError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError || !request) {
      return res.status(404).json({ error: 'Demande non trouvée' })
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' })
    }
    
    // Générer un code d'invitation
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    // Créer le code d'invitation dans la table
    const { data: invitationCode, error: codeError } = await supabase
      .from('invitation_codes')
      .insert({
        code,
        created_by_user_id: adminUser.id,
        school_id: request.school_id,
        entry_year: request.entry_year,
        max_uses: 1,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 jours
      })
      .select()
      .single()
    
    if (codeError) throw codeError
    
    // Mettre à jour la demande
    const { error: updateError } = await supabase
      .from('access_requests')
      .update({
        status: 'approved',
        invitation_code_id: invitationCode.id,
        processed_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (updateError) throw updateError
    
    // TODO: Envoyer email avec le code à request.email
    
    return res.json({ 
      success: true, 
      code,
      email: request.email 
    })
  } catch (error) {
    console.error('Error approving request:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/admin/access-requests/:id/reject - Rejeter
router.post('/access-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    
    const { data, error } = await supabase
      .from('access_requests')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single()
    
    if (error) throw error
    
    if (!data) {
      return res.status(404).json({ error: 'Demande non trouvée ou déjà traitée' })
    }
    
    // TODO: Envoyer email de rejet à data.email avec la raison
    
    return res.json({ success: true })
  } catch (error) {
    console.error('Error rejecting request:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/admin/users - Liste tous les utilisateurs avec recherche et filtres
router.get('/users', async (req, res) => {
  try {
    const { 
      search, 
      role, 
      school_id, 
      is_ambassador,
      page = 1,
      limit = 50 
    } = req.query
    
    let query = supabase
      .from('users')
      .select(`
        *,
        schools(id, name_fr, acronym, country)
      `, { count: 'exact' })
    
    // Recherche
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    
    // Filtres
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }
    
    if (school_id && school_id !== 'all') {
      query = query.eq('school_id', school_id)
    }
    
    if (is_ambassador === 'true') {
      query = query.eq('is_ambassador', true)
    }
    
    // Pagination
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1
    
    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)
    
    if (error) throw error
    
    return res.json({
      users: users || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PATCH /api/admin/users/:id
router.patch(
  '/users/:id',
  validateRequest(UpdateUserSchema),
  adminController.updateUser.bind(adminController)
)

// POST /api/admin/users/:id/set-ambassador
router.post(
  '/users/:id/set-ambassador',
  validateRequest(SetAmbassadorSchema),
  adminController.setAmbassador.bind(adminController)
)

// PATCH /api/admin/users/:id/increase-code-limit
router.patch(
  '/users/:id/increase-code-limit',
  validateRequest(IncreaseCodeLimitSchema),
  adminController.increaseCodeLimit.bind(adminController)
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GESTION ÉVÉNEMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /api/admin/events (liste TOUS les événements)
router.get('/events', adminController.getAllEvents.bind(adminController))

// GET /api/admin/events/:id/participants (détails participants)
router.get('/events/:id/participants', adminController.getEventParticipantsAdmin.bind(adminController))

// PATCH /api/admin/events/:id (modifier N'IMPORTE QUEL événement)
router.patch(
  '/events/:id',
  validateRequest(UpdateEventSchema),
  adminController.updateAnyEvent.bind(adminController)
)

// DELETE /api/admin/events/:id (supprimer N'IMPORTE QUEL événement)
router.delete('/events/:id', adminController.deleteAnyEvent.bind(adminController))

// PATCH /api/admin/users/:id/role - Changer le rôle
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    const adminUser = req.user
    
    if (!['alumni', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' })
    }
    
    // PROTECTION : Empêcher de retirer ses propres droits admin
    if (id === adminUser.id && role !== 'admin') {
      return res.status(403).json({ 
        error: 'Vous ne pouvez pas retirer vos propres droits administrateur' 
      })
    }
    
    // Récupérer le statut ambassadeur pour déterminer la limite
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('is_ambassador')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Déterminer la limite selon le nouveau rôle et le statut ambassadeur
    let max_codes_allowed = 3 // Par défaut : alumni normal
    if (role === 'admin') {
      max_codes_allowed = 999 // Admin : illimité
    } else if (userData?.is_ambassador) {
      max_codes_allowed = 15 // Ambassadeur : 15 codes
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role,
        max_codes_allowed 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return res.json(data)
  } catch (error) {
    console.error('Error updating role:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PATCH /api/admin/users/:id/ambassador - Changer statut ambassadeur
router.patch('/users/:id/ambassador', async (req, res) => {
  try {
    const { id } = req.params
    const { is_ambassador } = req.body
    
    // Récupérer le rôle de l'utilisateur pour déterminer la limite
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Déterminer la limite selon le rôle et le statut ambassadeur
    let max_codes_allowed = 3 // Par défaut : alumni normal
    if (userData?.role === 'admin') {
      max_codes_allowed = 999 // Admin : illimité
    } else if (is_ambassador) {
      max_codes_allowed = 15 // Ambassadeur : 15 codes
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_ambassador,
        max_codes_allowed 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return res.json(data)
  } catch (error) {
    console.error('Error updating ambassador status:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const adminUser = req.user // L'admin qui fait l'action
    
    // PROTECTION 1 : Empêcher de se supprimer soi-même
    if (id === adminUser.id) {
      return res.status(403).json({ 
        error: 'Vous ne pouvez pas supprimer votre propre compte' 
      })
    }
    
    // PROTECTION 2 : Vérifier si l'utilisateur à supprimer est admin
    const { data: targetUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single()
    
    if (targetUser?.role === 'admin') {
      return res.status(403).json({ 
        error: 'Impossible de supprimer un administrateur. Retirez-lui d\'abord les droits admin.' 
      })
    }
    
    // Supprimer dans auth.users d'abord
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    
    if (authError && authError.message !== 'User not found') {
      throw authError
    }
    
    // Supprimer dans public.users (CASCADE s'occupe des codes)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return res.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ==================== GESTION DES ÉCOLES ====================

// GET /api/admin/schools - Liste toutes les écoles
router.get('/schools', async (req, res) => {
  try {
    const { data: schools, error } = await supabase
      .from('schools')
      .select('*')
      .order('country', { ascending: true })
      .order('name_fr', { ascending: true })
    
    if (error) throw error
    
    // Compter les utilisateurs par école
    const schoolsWithCounts = await Promise.all(
      schools.map(async (school) => {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
        
        return {
          ...school,
          user_count: count || 0
        }
      })
    )
    
    return res.json(schoolsWithCounts)
  } catch (error) {
    console.error('Error fetching schools:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/admin/schools - Créer une école
router.post('/schools', async (req, res) => {
  try {
    const { name_fr, country, city, acronym, flag, established_year, description } = req.body
    
    const { data, error } = await supabase
      .from('schools')
      .insert({
        name_fr,
        country,
        city,
        acronym,
        flag,
        established_year,
        description
      })
      .select()
      .single()
    
    if (error) throw error
    
    return res.json(data)
  } catch (error) {
    console.error('Error creating school:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PATCH /api/admin/schools/:id - Modifier une école
router.patch('/schools/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name_fr, country, city, acronym, flag, established_year, description } = req.body
    
    const { data, error } = await supabase
      .from('schools')
      .update({
        name_fr,
        country,
        city,
        acronym,
        flag,
        established_year,
        description
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return res.json(data)
  } catch (error) {
    console.error('Error updating school:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE /api/admin/schools/:id - Supprimer une école
router.delete('/schools/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Vérifier qu'aucun utilisateur n'est lié
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', id)
    
    if (count && count > 0) {
      return res.status(400).json({ 
        error: `Impossible de supprimer : ${count} utilisateur(s) sont rattachés à cette école` 
      })
    }
    
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return res.json({ success: true })
  } catch (error) {
    console.error('Error deleting school:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router

