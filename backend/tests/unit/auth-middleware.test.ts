import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'

// Le middleware d'authentification distingue « pas de session valable » (401 : se reconnecter)
// de « la base ou Supabase ne répond pas » (503 : réessayer) ; une panne passagère ne doit pas déconnecter.
const getUser = vi.fn()
const single = vi.fn()
vi.mock('../../src/config/database.js', () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUser(...a) },
    from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ single: () => single() }) }) }) }),
  },
}))

const { supabaseAuthMiddleware } = await import('../../src/middleware/supabase-auth.middleware.js')

function appel(authorization?: string) {
  const req = { headers: authorization ? { authorization } : {} } as Request
  const res = { statusCode: 200, status(c: number) { this.statusCode = c; return this }, json: vi.fn() } as unknown as Response & { statusCode: number }
  const next = vi.fn()
  return supabaseAuthMiddleware(req, res, next).then(() => ({ req, status: res.statusCode, next }))
}

describe('supabaseAuthMiddleware', () => {
  beforeEach(() => {
    getUser.mockReset()
    single.mockReset()
  })

  it('laisse passer un membre actif', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    single.mockResolvedValue({ data: { id: 'u1', is_active: true }, error: null })
    const r = await appel('Bearer jeton')
    expect(r.next).toHaveBeenCalled()
    expect(r.req.user).toMatchObject({ id: 'u1' })
  })

  it('401 sans jeton, ou avec un jeton refusé', async () => {
    expect((await appel()).status).toBe(401)
    getUser.mockResolvedValue({ data: { user: null }, error: { name: 'AuthApiError', status: 401, message: 'invalid JWT' } })
    expect((await appel('Bearer faux')).status).toBe(401)
  })

  it('401 quand le compte n’existe pas ou est désactivé', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    single.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'no rows' } })
    expect((await appel('Bearer jeton')).status).toBe(401)
  })

  it('503 quand la base ou Supabase ne répond pas, sans laisser passer', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    single.mockResolvedValue({ data: null, error: { code: '', message: 'TypeError: fetch failed' } })
    const base = await appel('Bearer jeton')
    expect(base.status).toBe(503)
    expect(base.next).not.toHaveBeenCalled()

    getUser.mockResolvedValue({ data: { user: null }, error: { name: 'AuthRetryableFetchError', status: 0, message: 'fetch failed' } })
    const auth = await appel('Bearer jeton')
    expect(auth.status).toBe(503)
    expect(auth.next).not.toHaveBeenCalled()
  })
})
