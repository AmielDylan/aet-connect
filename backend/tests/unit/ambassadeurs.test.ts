import { describe, it, expect } from 'vitest'
import { supabase } from '@/config/database'
import { createAccessRequest, createMember, createPromo } from './support/fixtures'
import { api, register, session, uniqueEmail } from './support/http'

// Un seul ambassadeur par promo (école + année d'entrée).
describe('un ambassadeur par promo', () => {
  it("nommer un second ambassadeur dans la même promo est refusé, avec le nom de celui qui l'est déjà", async () => {
    const admin = await session('admin')
    const promo = await createPromo()
    const premier = await createMember({ promo })
    const second = await createMember({ promo })

    const ok = await api().patch(`/api/admin/users/${premier}/ambassador`).set('Authorization', admin.auth).send({ is_ambassador: true })
    const refus = await api().patch(`/api/admin/users/${second}/ambassador`).set('Authorization', admin.auth).send({ is_ambassador: true })

    expect(ok.status).toBe(200)
    expect(refus.status).toBe(409)
    expect(refus.body.error).toContain('Test Membre')
  })

  it("renommer ambassadeur celui qui l'est déjà reste permis", async () => {
    const admin = await session('admin')
    const promo = await createPromo()
    const membre = await createMember({ promo, isAmbassador: true })

    const res = await api().patch(`/api/admin/users/${membre}/ambassador`).set('Authorization', admin.auth).send({ is_ambassador: true })

    expect(res.status).toBe(200)
  })

  it('la base refuse deux ambassadeurs dans la même promo', async () => {
    const promo = await createPromo()
    await createMember({ promo, isAmbassador: true })
    const second = await createMember({ promo })

    const { error } = await supabase.from('users').update({ is_ambassador: true }).eq('id', second)

    expect(error?.code).toBe('23505')
  })

  it("accepter une demande « ambassadeur » est refusé si la promo a déjà un ambassadeur", async () => {
    const admin = await session('admin')
    const promo = await createPromo()
    await createMember({ promo, isAmbassador: true })
    const demande = await createAccessRequest(promo, true)

    const res = await api().post(`/api/admin/access-requests/${demande.id}/approve`).set('Authorization', admin.auth).send({ grants_ambassador: true })
    const sansStatut = await api().post(`/api/admin/access-requests/${demande.id}/approve`).set('Authorization', admin.auth).send({})

    expect(res.status).toBe(409)
    expect(res.body.reason).toBe('promo_has_ambassador')
    expect(sansStatut.status).toBe(200)
  })

  it("accepter une seconde demande « ambassadeur » est refusé tant que le premier code attend d'être utilisé", async () => {
    const admin = await session('admin')
    const promo = await createPromo()
    const a = await createAccessRequest(promo, true)
    const b = await createAccessRequest(promo, true)

    const premier = await api().post(`/api/admin/access-requests/${a.id}/approve`).set('Authorization', admin.auth).send({ grants_ambassador: true })
    const second = await api().post(`/api/admin/access-requests/${b.id}/approve`).set('Authorization', admin.auth).send({ grants_ambassador: true })

    expect(premier.status).toBe(200)
    expect(second.status).toBe(409)
    expect(second.body.reason).toBe('promo_has_ambassador')
  })

  it("un code « ambassadeur » utilisé quand la promo en a déjà un crée le compte, sans le statut", async () => {
    const admin = await session('admin')
    const promo = await createPromo()
    const demande = await createAccessRequest(promo, true)
    const approuve = await api().post(`/api/admin/access-requests/${demande.id}/approve`).set('Authorization', admin.auth).send({ grants_ambassador: true })
    // Entre-temps, un autre membre de la promo est devenu ambassadeur
    await createMember({ promo, isAmbassador: true })

    const email = uniqueEmail()
    const res = await register(approuve.body.code, email)
    const { data } = await supabase.from('users').select('is_ambassador').eq('email', email).single()

    expect(res.status).toBe(201)
    expect(data?.is_ambassador).toBe(false)
  })
})

describe("demandes d'accès", () => {
  it("chaque demande indique l'ambassadeur actuel de sa promo, ou null", async () => {
    const admin = await session('admin')
    const avec = await createPromo()
    await createMember({ promo: avec, isAmbassador: true })
    const sans = await createPromo()
    const a = await createAccessRequest(avec)
    const b = await createAccessRequest(sans)

    const res = await api().get('/api/admin/access-requests?status=pending').set('Authorization', admin.auth)
    const parId = new Map(res.body.map((d: any) => [d.id, d]))

    expect((parId.get(a.id) as any).promo_ambassador).toEqual({ first_name: 'Test', last_name: 'Membre' })
    expect((parId.get(b.id) as any).promo_ambassador).toBeNull()
  })
})
