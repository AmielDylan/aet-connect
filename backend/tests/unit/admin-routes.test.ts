import { describe, it, expect } from 'vitest'
import { createAccessRequest, createMember, createPromo } from './support/fixtures'
import { api, session } from './support/http'

describe('accès aux routes admin', () => {
  it('sans jeton : 401 ; membre non admin : 403', async () => {
    const member = await session('alumni')

    expect((await api().get('/api/admin/users')).status).toBe(401)
    expect((await api().get('/api/admin/users').set('Authorization', member.auth)).status).toBe(403)
  })
})

describe("demandes d'accès", () => {
  it("l'approbation renvoie le code et le message à transmettre", async () => {
    const admin = await session('admin')
    const request = await createAccessRequest(await createPromo())

    const res = await api().post(`/api/admin/access-requests/${request.id}/approve`).set('Authorization', admin.auth).send({})

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, email: request.email, delivery: { sent: false } })
    expect(res.body.delivery.text).toContain(res.body.code)
  })

  it('le rejet passe la demande en « rejetée » ; la rejeter une seconde fois est refusé', async () => {
    const admin = await session('admin')
    const request = await createAccessRequest(await createPromo())

    const first = await api().post(`/api/admin/access-requests/${request.id}/reject`).set('Authorization', admin.auth).send({})
    const second = await api().post(`/api/admin/access-requests/${request.id}/reject`).set('Authorization', admin.auth).send({})
    const rejected = await api().get('/api/admin/access-requests?status=rejected').set('Authorization', admin.auth)

    expect(first.status).toBe(200)
    expect(second.status).toBe(409)
    expect(rejected.body.map((r: any) => r.id)).toContain(request.id)
  })
})

describe('rôles et ambassadeurs', () => {
  it('promouvoir admin donne un quota illimité ; revenir alumni rend le quota de 3', async () => {
    const admin = await session('admin')
    const member = await session('alumni')

    const up = await api().patch(`/api/admin/users/${member.id}/role`).set('Authorization', admin.auth).send({ role: 'admin' })
    const down = await api().patch(`/api/admin/users/${member.id}/role`).set('Authorization', admin.auth).send({ role: 'alumni' })

    expect(up.body).toMatchObject({ role: 'admin', max_codes_allowed: 999 })
    expect(down.body).toMatchObject({ role: 'alumni', max_codes_allowed: 3 })
  })

  it("nommer ambassadeur donne 15 invitations ; retirer le statut les ramène à 3", async () => {
    const admin = await session('admin')
    const member = await session('alumni')

    const on = await api().patch(`/api/admin/users/${member.id}/ambassador`).set('Authorization', admin.auth).send({ is_ambassador: true })
    const off = await api().patch(`/api/admin/users/${member.id}/ambassador`).set('Authorization', admin.auth).send({ is_ambassador: false })

    expect(on.body).toMatchObject({ is_ambassador: true, max_codes_allowed: 15 })
    expect(off.body).toMatchObject({ is_ambassador: false, max_codes_allowed: 3 })
  })

  it('un rôle inconnu est refusé', async () => {
    const admin = await session('admin')
    const member = await session('alumni')

    const res = await api().patch(`/api/admin/users/${member.id}/role`).set('Authorization', admin.auth).send({ role: 'superadmin' })

    expect(res.status).toBe(400)
  })
})

describe('garde-fous', () => {
  it("un admin ne peut ni retirer ses propres droits, ni se supprimer, ni supprimer un autre admin", async () => {
    const admin = await session('admin')
    const otherAdmin = await session('admin')

    const demote = await api().patch(`/api/admin/users/${admin.id}/role`).set('Authorization', admin.auth).send({ role: 'alumni' })
    const self = await api().delete(`/api/admin/users/${admin.id}`).set('Authorization', admin.auth)
    const other = await api().delete(`/api/admin/users/${otherAdmin.id}`).set('Authorization', admin.auth)

    expect([demote.status, self.status, other.status]).toEqual([403, 403, 403])
  })

  it('une école qui a des membres ne peut pas être supprimée', async () => {
    const admin = await session('admin')
    const member = await session('alumni')

    const res = await api().delete(`/api/admin/schools/${member.promo.schoolId}`).set('Authorization', admin.auth)

    expect(res.status).toBe(400)
  })

  it("rejeter une demande de suppression déjà traitée est refusé", async () => {
    const admin = await session('admin')
    const member = await session('alumni')
    await api().post('/api/users/me/deletion-request').set('Authorization', member.auth).send({})
    const pending = await api().get('/api/admin/deletion-requests?status=pending').set('Authorization', admin.auth)
    const request = pending.body.find((r: any) => r.requester_email === member.email)

    const first = await api().post(`/api/admin/deletion-requests/${request.id}/reject`).set('Authorization', admin.auth)
    const second = await api().post(`/api/admin/deletion-requests/${request.id}/reject`).set('Authorization', admin.auth)

    expect([first.status, second.status]).toEqual([200, 409])
  })
})

describe('statistiques', () => {
  it('la répartition par rôle compte tous les membres, au-delà des 1 000 premières lignes', async () => {
    const admin = await session('admin')

    const res = await api().get('/api/admin/stats').set('Authorization', admin.auth)

    expect(res.status).toBe(200)
    const parRole = Object.values(res.body.roles as Record<string, number>).reduce((a, b) => a + b, 0)
    expect(parRole).toBe(res.body.overview.totalUsers)
  })
})

describe('liste des membres', () => {
  it("donne les nombres par type pour l'école choisie, l'ambassadeur de chaque promo et les invitations utilisées", async () => {
    const adminSession = await session('admin')
    const promo = await createPromo()
    const ambassadeur = await createMember({ promo, isAmbassador: true })
    const membre = await createMember({ promo })
    await createMember({ promo, role: 'admin' })
    const { supabase } = await import('@/config/database')
    await supabase.from('invitation_codes').insert({
      code: `AET-T${Date.now().toString(36).slice(-3).toUpperCase()}-TEST`, school_id: promo.schoolId, entry_year: promo.entryYear,
      created_by_user_id: membre, max_uses: 1, expires_at: new Date(Date.now() + 86_400_000).toISOString()
    })

    const res = await api().get(`/api/admin/users?school_id=${promo.schoolId}`).set('Authorization', adminSession.auth)
    const parId = new Map(res.body.users.map((u: any) => [u.id, u]))

    expect(res.status).toBe(200)
    expect(res.body.counts).toEqual({ all: 3, alumni: 2, moderator: 0, admin: 1, ambassadors: 1 })
    expect((parId.get(membre) as any).promo_ambassador).toEqual({ first_name: 'Test', last_name: 'Membre' })
    expect((parId.get(ambassadeur) as any).promo_ambassador).toBeNull()
    expect((parId.get(membre) as any).invitations_used).toBe(1)
  })
})
