import { Router } from 'express'
import { supabase } from '@/config/database'
import { invitations } from '@/invitations'
import { asyncRoute, HttpError } from '@/utils/http'
import { toutesLesLignes } from '@/utils/pages'

// Demandes d'accès : une personne sans code demande à rejoindre sa promo.
const router = Router()

// GET /api/admin/access-requests?status=pending|approved|rejected|all
router.get('/', asyncRoute(async (req, res) => {
  const status = (req.query.status as string) ?? 'pending'
  let query = supabase
    .from('access_requests')
    .select('*, schools!left(id, name_fr, acronym, country)')
    .order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  const demandes = data ?? []

  // L'ambassadeur actuel de chaque promo demandée : un seul par promo, l'admin le voit avant de choisir
  // Tous les ambassadeurs (un par promo au plus, donc peu nombreux), lus par lots : une liste d'écoles dans
  // l'adresse de la requête dépasserait sa longueur maximale dès qu'il y a beaucoup de demandes
  const ambassadeurs = demandes.length
    ? await toutesLesLignes<{ first_name: string | null; last_name: string | null; school_id: string; entry_year: string }>((de, a) =>
        supabase.from('users').select('first_name, last_name, school_id, entry_year').eq('is_ambassador', true).order('id').range(de, a))
    : []
  const parPromo = new Map(ambassadeurs.map((a) => [`${a.school_id}|${a.entry_year}`, { first_name: a.first_name, last_name: a.last_name }]))

  res.json(demandes.map((d) => ({ ...d, promo_ambassador: parPromo.get(`${d.school_id}|${d.entry_year}`) ?? null })))
}))

// POST /api/admin/access-requests/:id/approve { grants_ambassador? }
// Émet un code pour la promo de la demande (module Code d'invitation).
// delivery.sent=false : l'admin transmet lui-même delivery.text.
router.post('/:id/approve', asyncRoute(async (req, res) => {
  const issued = await invitations.issue(req.user.id, {
    accessRequestId: req.params.id,
    grantsAmbassador: req.body?.grants_ambassador === true
  })
  res.json({
    success: true,
    code: issued.code,
    expires_at: issued.expiresAt.toISOString(),
    email: issued.delivery?.email.to,
    delivery: issued.delivery && {
      sent: issued.delivery.sent,
      subject: issued.delivery.email.subject,
      text: issued.delivery.email.text
    }
  })
}))

// POST /api/admin/access-requests/:id/reject
router.post('/:id/reject', asyncRoute(async (req, res) => {
  const { data, error } = await supabase
    .from('access_requests')
    .update({ status: 'rejected', processed_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('status', 'pending')
    .select('id')
  if (error) throw error
  if (!data?.length) throw new HttpError(409, 'Demande introuvable ou déjà traitée')
  // TODO : prévenir la personne (seam email du module Code d'invitation)
  res.json({ success: true })
}))

export default router
