import { randomUUID } from 'crypto'
import request from 'supertest'
import app from '@/app'
import { createCredentialsClient } from '@/config/database'

export const api = () => request(app)

/** Chaque test a sa propre « adresse IP » : la limite de débit ne déborde pas d'un test à l'autre. */
export const freshIp = () => `198.51.100.${Math.floor(Math.random() * 250) + 1}`

export const PASSWORD = 'Motdepasse123!'

export const uniqueEmail = (prefix = 'inscrit') => `${prefix}-${randomUUID()}@aetconnect.test`

/** Jeton d'accès d'un membre, comme le frontend l'obtient (connexion Supabase). Null si la connexion échoue. */
export async function tokenFor(email: string, password = PASSWORD): Promise<string | null> {
  const { data } = await createCredentialsClient().auth.signInWithPassword({ email, password })
  return data.session?.access_token ?? null
}

/** Un compte avec son jeton, prêt pour les appels HTTP. role 'admin' : promu après création, comme dans l'appli. */
export async function session(role: 'alumni' | 'admin' = 'alumni') {
  const { supabase } = await import('@/config/database')
  const { createPromo } = await import('./fixtures')
  const promo = await createPromo()
  const email = uniqueEmail(role)
  const { data, error } = await supabase.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true,
    user_metadata: { first_name: 'Test', last_name: role, school_id: promo.schoolId, entry_year: promo.entryYear }
  })
  if (error || !data.user) throw error ?? new Error('createUser sans utilisateur')
  if (role === 'admin') await supabase.from('users').update({ role: 'admin', max_codes_allowed: 999 }).eq('id', data.user.id)
  return { id: data.user.id, email, promo, auth: `Bearer ${await tokenFor(email)}` }
}

export async function register(code: string, email: string, extra: Record<string, unknown> = {}) {
  return api()
    .post('/api/register/complete-registration')
    .set('X-Forwarded-For', freshIp())
    .send({ invitation_code: code, first_name: 'Awa', last_name: 'Traoré', email, password: PASSWORD, ...extra })
}
