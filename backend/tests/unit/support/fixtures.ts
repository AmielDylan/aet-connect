import { randomUUID } from 'crypto'
import { supabase } from '@/config/database'
import type { Promo } from '@/invitations'

// Fixtures pour les tests du module Code d'invitation.
// Chaque test crée sa propre école : les promos ne se croisent jamais.

export async function createPromo(entryYear = '2005'): Promise<Promo> {
  const { data, error } = await supabase
    .from('schools')
    .insert({ name_fr: `École test ${randomUUID().slice(0, 8)}`, city: 'Testville', country: 'Bénin' })
    .select('id')
    .single()
  if (error) throw error
  return { schoolId: data.id, entryYear }
}

type MemberOptions = {
  promo: Promo
  role?: 'alumni' | 'admin'
  isAmbassador?: boolean
  maxCodesAllowed?: number
}

export async function createMember({ promo, role = 'alumni', isAmbassador = false, maxCodesAllowed }: MemberOptions): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email: `membre-${randomUUID()}@aetconnect.test`,
    password: 'Motdepasse123!',
    email_confirm: true,
    user_metadata: {
      first_name: 'Test',
      last_name: role === 'admin' ? 'Admin' : 'Membre',
      school_id: promo.schoolId,
      entry_year: promo.entryYear,
      role,
      is_ambassador: isAmbassador,
      ...(maxCodesAllowed !== undefined ? { max_codes_allowed: maxCodesAllowed } : {})
    }
  })
  if (error || !data.user) throw error ?? new Error('createUser sans utilisateur')
  return data.user.id
}

export async function createAccessRequest(promo: Promo, wantsAmbassador = false): Promise<{ id: string; email: string }> {
  const email = `demande-${randomUUID()}@aetconnect.test`
  const { data, error } = await supabase
    .from('access_requests')
    .insert({
      school_id: promo.schoolId,
      entry_year: promo.entryYear,
      first_name: 'Nouvelle',
      last_name: 'Personne',
      email,
      message: 'Je suis de cette promo',
      wants_ambassador: wantsAmbassador,
      status: 'pending'
    })
    .select('id')
    .single()
  if (error) throw error
  return { id: data.id, email }
}

/** Mise en place : fait expirer un code (le module ne permet pas de voyager dans le temps). */
export async function expireCode(codeId: string) {
  const { error } = await supabase
    .from('invitation_codes')
    .update({ expires_at: new Date(Date.now() - 60_000).toISOString() })
    .eq('id', codeId)
  if (error) throw error
}

/** createAccount factice pour redeem : crée un vrai membre dans la promo accordée. */
export function accountCreator() {
  return async (grant: { promo: Promo }) => createMember({ promo: grant.promo })
}
