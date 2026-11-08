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

export async function register(code: string, email: string, extra: Record<string, unknown> = {}) {
  return api()
    .post('/api/register/complete-registration')
    .set('X-Forwarded-For', freshIp())
    .send({ invitation_code: code, first_name: 'Awa', last_name: 'Traoré', email, password: PASSWORD, ...extra })
}
