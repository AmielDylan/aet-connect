import { describe, it, expect } from 'vitest'
import { randomUUID } from 'crypto'
import { supabase } from '@/config/database'
import { createInvitations, InMemoryMailer } from '@/invitations'
import { createPromo, createMember } from './support/fixtures'
import { api, register, tokenFor, uniqueEmail, PASSWORD } from './support/http'

const invitations = createInvitations({ db: supabase, mailer: new InMemoryMailer(), appUrl: 'https://app.test' })

describe('inscription (POST /api/register/complete-registration)', () => {
  it("crée la fiche avec l'identité saisie et la promo du code, en simple alumni", async () => {
    const promo = await createPromo()
    const { code } = await invitations.issue(await createMember({ promo }))
    const email = uniqueEmail()

    const res = await register(code, email, { role: 'admin', is_ambassador: true })
    expect(res.status).toBe(201)

    const me = await api().get('/api/auth/me').set('Authorization', `Bearer ${await tokenFor(email)}`)
    expect(me.body).toMatchObject({
      email,
      first_name: 'Awa',
      last_name: 'Traoré',
      school_id: promo.schoolId,
      entry_year: promo.entryYear,
      role: 'alumni',
      is_ambassador: false,
      max_codes_allowed: 3
    })
  })

  it('les réglages de confidentialité du nouveau membre sont ceux par défaut', async () => {
    const promo = await createPromo()
    const { code } = await invitations.issue(await createMember({ promo }))
    const email = uniqueEmail()
    await register(code, email)

    const res = await api().get('/api/users/me/privacy').set('Authorization', `Bearer ${await tokenFor(email)}`)

    expect(res.body).toMatchObject({ show_email: false, show_phone: false, show_in_directory: true })
  })

  it("si la fiche ne peut pas être écrite, aucun compte ne reste et le code est rendu", async () => {
    const admin = await createMember({ promo: await createPromo(), role: 'admin' })
    const { code } = await invitations.issue(admin, { promo: 'universal' })
    const email = uniqueEmail()

    const res = await register(code, email, { school_id: randomUUID(), entry_year: '2001' })

    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(await tokenFor(email)).toBeNull()
    await expect(invitations.check(code)).resolves.toMatchObject({ valid: true })
  })
})

describe('création de compte par Supabase Auth (défense en profondeur)', () => {
  it('des métadonnées réclamant le rôle admin ne donnent aucun droit', async () => {
    const promo = await createPromo()
    const email = uniqueEmail('intrus')
    await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: 'Intrus', last_name: 'Test', school_id: promo.schoolId, entry_year: promo.entryYear,
        role: 'admin', is_ambassador: true, max_codes_allowed: 999
      }
    })

    const me = await api().get('/api/auth/me').set('Authorization', `Bearer ${await tokenFor(email)}`)

    expect(me.body).toMatchObject({ role: 'alumni', is_ambassador: false, max_codes_allowed: 3 })
  })
})

async function adminToken() {
  const promo = await createPromo()
  const email = uniqueEmail('admin')
  const { data } = await supabase.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true,
    user_metadata: { first_name: 'Ada', last_name: 'Admin', school_id: promo.schoolId, entry_year: promo.entryYear }
  })
  await supabase.from('users').update({ role: 'admin' }).eq('id', data.user!.id)
  return `Bearer ${await tokenFor(email)}`
}

/** Un parrain invite un membre ; ce membre émet à son tour un code encore valable. */
async function sponsoredMember() {
  const promo = await createPromo()
  const sponsor = await createMember({ promo })
  const { code } = await invitations.issue(sponsor)
  const email = uniqueEmail('membre')
  await register(code, email)
  const token = await tokenFor(email)
  const me = await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`)
  const issued = await invitations.issue(me.body.id)
  return { sponsor, memberId: me.body.id as string, email, token, issuedCode: issued.code }
}

describe("suppression d'un membre (DELETE /api/admin/users/:id)", () => {
  it('le compte disparaît, le code utilisé reste utilisé, et les codes valables du membre sont révoqués', async () => {
    const { sponsor, memberId, email, issuedCode } = await sponsoredMember()

    const res = await api().delete(`/api/admin/users/${memberId}`).set('Authorization', await adminToken())
    expect(res.status).toBe(200)

    expect(await tokenFor(email)).toBeNull()
    await expect(invitations.quota(sponsor)).resolves.toMatchObject({ used: 1 })
    await expect(invitations.check(issuedCode)).resolves.toEqual({ valid: false, reason: 'revoked' })
  })
})

describe("demande de suppression approuvée (POST /api/admin/deletion-requests/:id/approve)", () => {
  it("supprime le compte et garde la trace de la demande, avec l'email du membre", async () => {
    const { email, token } = await sponsoredMember()
    await api().post('/api/users/me/deletion-request').set('Authorization', `Bearer ${token}`).send({ reason: 'Je quitte le réseau' })
    const admin = await adminToken()
    const pending = await api().get('/api/admin/deletion-requests?status=pending').set('Authorization', admin)
    const request = pending.body.find((r: any) => r.requester_email === email)
    expect(request).toBeDefined()

    const res = await api().post(`/api/admin/deletion-requests/${request.id}/approve`).set('Authorization', admin)
    expect(res.status).toBe(200)

    expect(await tokenFor(email)).toBeNull()
    const approved = await api().get('/api/admin/deletion-requests?status=approved').set('Authorization', admin)
    expect(approved.body.find((r: any) => r.id === request.id)).toMatchObject({ status: 'approved', requester_email: email })
  })
})
