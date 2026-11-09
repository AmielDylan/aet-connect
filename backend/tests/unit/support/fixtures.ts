import { randomUUID } from 'crypto'
import { supabase } from '@/config/database'
import type { Promo } from '@/invitations'

// Fixtures pour les tests du module Code d'invitation.
// Chaque test crée sa propre école : les promos ne se croisent jamais.

export async function createPromo(entryYear = '2005', country = 'Bénin'): Promise<Promo> {
  const { data, error } = await supabase
    .from('schools')
    .insert({ name_fr: `École test ${randomUUID().slice(0, 8)}`, city: 'Testville', country })
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
      entry_year: promo.entryYear
    }
  })
  if (error || !data.user) throw error ?? new Error('createUser sans utilisateur')

  // Les droits ne viennent jamais de l'inscription : on les accorde ensuite, comme un admin le ferait
  const rights: Record<string, unknown> = {}
  if (role !== 'alumni') rights.role = role
  if (isAmbassador) rights.is_ambassador = true
  if (maxCodesAllowed !== undefined) rights.max_codes_allowed = maxCodesAllowed
  if (Object.keys(rights).length) {
    const { error: promoteError } = await supabase.from('users').update(rights).eq('id', data.user.id)
    if (promoteError) throw promoteError
  }
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

type Privacy = Partial<Record<
  'show_email' | 'show_phone' | 'show_current_location' | 'show_bio' | 'show_linkedin' | 'show_entry_year' | 'show_in_directory',
  boolean
>>

/** Membre avec un profil rempli et des réglages de confidentialité choisis (mise en place, comme le ferait le membre). */
export async function createProfile(args: {
  promo: Promo
  firstName?: string
  lastName?: string
  profile?: Partial<Record<'current_city' | 'current_country' | 'bio' | 'phone' | 'linkedin_url', string>>
  privacy?: Privacy
}): Promise<{ id: string; email: string }> {
  const id = await createMember({ promo: args.promo })
  const updates: Record<string, unknown> = { ...args.profile }
  if (args.firstName) updates.first_name = args.firstName
  if (args.lastName) updates.last_name = args.lastName
  if (Object.keys(updates).length) {
    const { error } = await supabase.from('users').update(updates).eq('id', id)
    if (error) throw error
  }
  if (args.privacy) {
    const { error } = await supabase.from('user_privacy_settings').update(args.privacy).eq('user_id', id)
    if (error) throw error
  }
  const { data } = await supabase.from('users').select('email').eq('id', id).single()
  return { id, email: data!.email }
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
