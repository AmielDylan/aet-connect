import { describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '@/config/database'
import { createInvitations, InMemoryMailer, type Invitations } from '@/invitations'
import { createPromo, createMember, expireCode, accountCreator, createAccessRequest } from './support/fixtures'

const DAY = 24 * 60 * 60 * 1000

let mailer: InMemoryMailer
let invitations: Invitations

beforeEach(() => {
  mailer = new InMemoryMailer()
  invitations = createInvitations({ db: supabase, mailer, appUrl: 'https://app.test' })
})

describe('issue', () => {
  it("un membre émet un code pour sa promo, au format AET-XXXX-XXXX, valable 30 jours", async () => {
    const promo = await createPromo()
    const member = await createMember({ promo })

    const issued = await invitations.issue(member)

    expect(issued.code).toMatch(/^AET-[A-HJ-KMNP-Z2-9]{4}-[A-HJ-KMNP-Z2-9]{4}$/)
    expect(issued.promo).toEqual(promo)
    expect(issued.expiresAt.getTime() - Date.now()).toBeGreaterThan(29.9 * DAY)
    expect(issued.expiresAt.getTime() - Date.now()).toBeLessThan(30.1 * DAY)
  })

  it('un alumni ne peut pas dépasser 3 codes', async () => {
    const promo = await createPromo()
    const member = await createMember({ promo })

    for (let i = 0; i < 3; i++) await invitations.issue(member)

    await expect(invitations.issue(member)).rejects.toMatchObject({ reason: 'quota_reached' })
  })

  it("un code expiré sans avoir servi rend sa place dans le quota", async () => {
    const promo = await createPromo()
    const member = await createMember({ promo })
    const first = await invitations.issue(member)
    await invitations.issue(member)
    await invitations.issue(member)

    await expireCode(first.id)

    await expect(invitations.issue(member)).resolves.toMatchObject({ promo })
  })

  it('un admin émet un code universel à plusieurs usages, sans limite de quota', async () => {
    const admin = await createMember({ promo: await createPromo(), role: 'admin' })

    for (let i = 0; i < 4; i++) await invitations.issue(admin, { promo: 'universal', maxUses: 5 })
    const issued = await invitations.issue(admin, { promo: 'universal', maxUses: 5 })

    expect(issued.promo).toBeNull()
    expect(issued.maxUses).toBe(5)
  })

  it('un admin émet un code pour une autre promo que la sienne', async () => {
    const admin = await createMember({ promo: await createPromo(), role: 'admin' })
    const target = await createPromo('1998')

    const issued = await invitations.issue(admin, { promo: target })

    expect(issued.promo).toEqual(target)
    expect(issued.maxUses).toBe(1)
  })

  it("un membre ne peut pas choisir la promo ni le nombre d'usages", async () => {
    const promo = await createPromo()
    const member = await createMember({ promo })

    await expect(invitations.issue(member, { promo: 'universal' })).rejects.toMatchObject({ reason: 'not_allowed' })
    await expect(invitations.issue(member, { maxUses: 3 })).rejects.toMatchObject({ reason: 'not_allowed' })
  })
})

describe('check', () => {
  it('reconnaît un code valide malgré la casse, les espaces et les tirets, et donne sa promo', async () => {
    const promo = await createPromo()
    const member = await createMember({ promo })
    const { code } = await invitations.issue(member)
    const typed = `  ${code.toLowerCase().replace(/-/g, ' ')} `

    const result = await invitations.check(typed)

    expect(result).toMatchObject({ valid: true, code, promo })
  })

  it('refuse un code inconnu', async () => {
    await expect(invitations.check('AET-ZZZZ-ZZZZ')).resolves.toEqual({ valid: false, reason: 'unknown' })
  })

  it('refuse un code expiré', async () => {
    const promo = await createPromo()
    const issued = await invitations.issue(await createMember({ promo }))
    await expireCode(issued.id)

    await expect(invitations.check(issued.code)).resolves.toEqual({ valid: false, reason: 'expired' })
  })

  it('un code universel est valide sans promo', async () => {
    const admin = await createMember({ promo: await createPromo(), role: 'admin' })
    const { code } = await invitations.issue(admin, { promo: 'universal' })

    await expect(invitations.check(code)).resolves.toMatchObject({ valid: true, promo: null })
  })
})

describe('redeem', () => {
  it('consomme le code, crée le compte dans la promo du code, et le code ne resservira pas', async () => {
    const promo = await createPromo()
    const { code } = await invitations.issue(await createMember({ promo }))
    const grants: unknown[] = []

    const { memberId } = await invitations.redeem(code, {}, async (grant) => {
      grants.push(grant)
      return accountCreator()(grant)
    })

    expect(memberId).toEqual(expect.any(String))
    expect(grants).toEqual([{ promo, grantsAmbassador: false }])
    await expect(invitations.check(code)).resolves.toEqual({ valid: false, reason: 'exhausted' })
  })

  it("si la création du compte échoue, le code est rendu et reste utilisable", async () => {
    const promo = await createPromo()
    const { code } = await invitations.issue(await createMember({ promo }))

    await expect(
      invitations.redeem(code, {}, async () => { throw new Error('email déjà utilisé') })
    ).rejects.toThrow('email déjà utilisé')

    await expect(invitations.check(code)).resolves.toMatchObject({ valid: true })
  })

  it('deux inscriptions simultanées sur un code à usage unique : une seule réussit', async () => {
    const promo = await createPromo()
    const { code } = await invitations.issue(await createMember({ promo }))

    const results = await Promise.allSettled([
      invitations.redeem(code, {}, accountCreator()),
      invitations.redeem(code, {}, accountCreator())
    ])

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult
    expect(rejected.reason).toMatchObject({ reason: 'exhausted' })
  })

  it('un code universel inscrit dans la promo choisie, et exige ce choix', async () => {
    const admin = await createMember({ promo: await createPromo(), role: 'admin' })
    const { code } = await invitations.issue(admin, { promo: 'universal', maxUses: 2 })
    const chosen = await createPromo('2011')

    await expect(invitations.redeem(code, {}, accountCreator())).rejects.toMatchObject({ reason: 'promo_required' })

    const grants: unknown[] = []
    await invitations.redeem(code, { promo: chosen }, async (grant) => {
      grants.push(grant)
      return accountCreator()(grant)
    })
    expect(grants).toEqual([{ promo: chosen, grantsAmbassador: false }])
  })
})

describe('revoke', () => {
  it('un membre révoque son code non utilisé : le code est refusé et sa place revient', async () => {
    const promo = await createPromo()
    const member = await createMember({ promo })
    const first = await invitations.issue(member)
    await invitations.issue(member)
    await invitations.issue(member)

    await invitations.revoke(member, first.id)

    await expect(invitations.check(first.code)).resolves.toEqual({ valid: false, reason: 'revoked' })
    await expect(invitations.issue(member)).resolves.toMatchObject({ promo })
  })

  it("on ne révoque ni un code déjà utilisé, ni le code d'un autre membre", async () => {
    const promo = await createPromo()
    const member = await createMember({ promo })
    const other = await createMember({ promo })
    const used = await invitations.issue(member)
    const unused = await invitations.issue(member)
    await invitations.redeem(used.code, {}, accountCreator())

    await expect(invitations.revoke(member, used.id)).rejects.toMatchObject({ reason: 'already_used' })
    await expect(invitations.revoke(other, unused.id)).rejects.toMatchObject({ reason: 'not_owner' })
  })
})

describe("approbation d'une demande d'accès", () => {
  it("émet un code pour la promo de la demande et l'envoie par email au demandeur", async () => {
    const promo = await createPromo()
    const admin = await createMember({ promo: await createPromo(), role: 'admin' })
    const request = await createAccessRequest(promo)

    const issued = await invitations.issue(admin, { accessRequestId: request.id })

    expect(issued.promo).toEqual(promo)
    expect(issued.delivery).toEqual({ sent: true, email: mailer.sent[0] })
    expect(mailer.sent).toHaveLength(1)
    expect(mailer.sent[0].to).toBe(request.email)
    expect(mailer.sent[0].text).toContain(issued.code)
    expect(mailer.sent[0].text).toContain(`https://app.test/register/with-code?code=${issued.code}`)
  })

  it("une demande déjà approuvée ne peut pas l'être une seconde fois", async () => {
    const admin = await createMember({ promo: await createPromo(), role: 'admin' })
    const request = await createAccessRequest(await createPromo())
    await invitations.issue(admin, { accessRequestId: request.id })

    await expect(invitations.issue(admin, { accessRequestId: request.id })).rejects.toMatchObject({ reason: 'request_not_pending' })
  })

  it("un code qui accorde le rôle d'ambassadeur fait de la personne inscrite une ambassadrice, avec son quota", async () => {
    const promo = await createPromo()
    const admin = await createMember({ promo: await createPromo(), role: 'admin' })
    const request = await createAccessRequest(promo, true)
    const { code } = await invitations.issue(admin, { accessRequestId: request.id, grantsAmbassador: true })

    await expect(invitations.check(code)).resolves.toMatchObject({ grantsAmbassador: true })
    const { memberId } = await invitations.redeem(code, {}, accountCreator())

    for (let i = 0; i < 4; i++) await invitations.issue(memberId)
  })

  it("seul un admin approuve une demande", async () => {
    const promo = await createPromo()
    const member = await createMember({ promo })
    const request = await createAccessRequest(promo)

    await expect(invitations.issue(member, { accessRequestId: request.id })).rejects.toMatchObject({ reason: 'not_allowed' })
  })
})

describe('quota', () => {
  it("donne la limite, les places prises et restantes d'un membre ; un admin n'a pas de limite", async () => {
    const promo = await createPromo()
    const member = await createMember({ promo })
    const admin = await createMember({ promo, role: 'admin' })
    await invitations.issue(member)

    await expect(invitations.quota(member)).resolves.toEqual({ limit: 3, used: 1, remaining: 2 })
    await expect(invitations.quota(admin)).resolves.toEqual({ limit: null, used: 0, remaining: null })
  })
})
