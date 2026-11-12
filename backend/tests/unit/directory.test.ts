import { describe, it, expect, beforeAll } from 'vitest'
import { randomUUID } from 'crypto'
import { createPromo, createProfile } from './support/fixtures'
import { api, session } from './support/http'
import { supabase } from '@/config/database'

let viewer: Awaited<ReturnType<typeof session>>
let admin: Awaited<ReturnType<typeof session>>

beforeAll(async () => {
  viewer = await session('alumni')
  admin = await session('admin')
})

const directory = (query: Record<string, string>) =>
  api().get(`/api/users?${new URLSearchParams(query)}`).set('Authorization', viewer.auth)

describe('accès', () => {
  it("l'annuaire, les profils et les filtres exigent d'être connecté", async () => {
    const statuses = await Promise.all([
      api().get('/api/users'),
      api().get(`/api/users/${randomUUID()}`),
      api().get('/api/users/filters/cities')
    ].map(async (r) => (await r).status))

    expect(statuses).toEqual([401, 401, 401])
  })
})

describe("annuaire (GET /api/users)", () => {
  it("un membre masqué n'apparaît ni dans la liste, ni dans le total, ni en profil", async () => {
    const promo = await createPromo()
    const visible = await createProfile({ promo })
    const hidden = await createProfile({ promo, privacy: { show_in_directory: false } })

    const res = await directory({ school_id: promo.schoolId })
    const profile = await api().get(`/api/users/${hidden.id}`).set('Authorization', viewer.auth)

    expect(res.body.users.map((u: any) => u.id)).toEqual([visible.id])
    expect(res.body.total).toBe(1)
    expect(profile.status).toBe(404)
  })

  it('une page reste pleine même quand des membres sont masqués', async () => {
    const promo = await createPromo()
    for (let i = 0; i < 3; i++) await createProfile({ promo })
    for (let i = 0; i < 2; i++) await createProfile({ promo, privacy: { show_in_directory: false } })

    const res = await directory({ school_id: promo.schoolId, limit: '3' })

    expect(res.body.users).toHaveLength(3)
    expect(res.body.total).toBe(3)
  })

  it("le filtre par pays de l'école donne le bon total", async () => {
    const country = `Pays-${randomUUID().slice(0, 6)}`
    const a = await createPromo('2005', country)
    const b = await createPromo('2010', country)
    await createProfile({ promo: a })
    await createProfile({ promo: b })
    await createProfile({ promo: b, privacy: { show_in_directory: false } })

    const res = await directory({ country, limit: '1' })

    expect(res.body.users).toHaveLength(1)
    expect(res.body.total).toBe(2)
  })

  it('les champs sont masqués selon les réglages du membre', async () => {
    const promo = await createPromo()
    const discreet = await createProfile({
      promo,
      profile: { current_city: 'Dakar', bio: 'Ma bio', phone: '+221000000', linkedin_url: 'https://linkedin.com/in/x' },
      privacy: { show_bio: false }
    })
    const open = await createProfile({ promo, profile: { phone: '+229000000' }, privacy: { show_email: true, show_phone: true } })

    const res = await directory({ school_id: promo.schoolId })
    const byId = Object.fromEntries(res.body.users.map((u: any) => [u.id, u]))

    expect(byId[discreet.id]).toMatchObject({
      current_city: 'Dakar', linkedin_url: 'https://linkedin.com/in/x', bio: null, entry_year: promo.entryYear, email: null, phone: null
    })
    expect(byId[open.id]).toMatchObject({ email: open.email, phone: '+229000000' })
  })

  it("la promo se voit toujours : la base refuse de la masquer, et l'API ignore la demande", async () => {
    const promo = await createPromo('1999')
    const member = await createProfile({ promo })

    const { error } = await supabase.from('user_privacy_settings').update({ show_entry_year: false }).eq('user_id', member.id)
    expect(error).not.toBeNull()

    const res = await directory({ school_id: promo.schoolId, entry_year: '1999' })
    expect(res.body.total).toBe(1)
    expect(res.body.users[0].entry_year).toBe('1999')
  })

  it('la recherche ignore les accents', async () => {
    const promo = await createPromo()
    const member = await createProfile({ promo, firstName: 'Mathieu', lastName: 'Kérékou' })

    const res = await directory({ school_id: promo.schoolId, search: 'kerekou' })

    expect(res.body.users.map((u: any) => u.id)).toEqual([member.id])
  })

  it("une recherche piégée ne permet pas de sonder les emails masqués", async () => {
    const promo = await createPromo()
    const probe = `sonde${randomUUID().slice(0, 8)}`
    await createProfile({ promo, firstName: 'Awa', lastName: 'Sow' })
    const res = await directory({ school_id: promo.schoolId, search: `${probe},email.ilike.*aetconnect*` })

    expect(res.status).toBe(200)
    expect(res.body.total).toBe(0)
  })
})

describe('profil (GET /api/users/:id)', () => {
  it("renvoie le profil masqué selon les réglages, avec l'école", async () => {
    const promo = await createPromo()
    const member = await createProfile({ promo, profile: { bio: 'Bonjour' }, privacy: { show_bio: true } })

    const res = await api().get(`/api/users/${member.id}`).set('Authorization', viewer.auth)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: member.id, bio: 'Bonjour', email: null, school: { id: promo.schoolId } })
  })
})

describe('filtres (GET /api/users/filters/*)', () => {
  it("ne proposent que des valeurs visibles : ni la ville d'un membre masqué, ni une ville cachée", async () => {
    const promo = await createPromo()
    const hiddenCity = `Ville-${randomUUID().slice(0, 6)}`
    const privateCity = `Ville-${randomUUID().slice(0, 6)}`
    const publicCity = `Ville-${randomUUID().slice(0, 6)}`
    await createProfile({ promo, profile: { current_city: hiddenCity }, privacy: { show_in_directory: false } })
    await createProfile({ promo, profile: { current_city: privateCity }, privacy: { show_current_location: false } })
    await createProfile({ promo, profile: { current_city: publicCity } })

    const res = await api().get('/api/users/filters/cities').set('Authorization', viewer.auth)

    expect(res.body.cities).toContain(publicCity)
    expect(res.body.cities).not.toContain(hiddenCity)
    expect(res.body.cities).not.toContain(privateCity)
  })
})

describe('liste admin des membres (GET /api/admin/users)', () => {
  it('la recherche est un simple texte : une virgule ne peut pas ajouter de condition', async () => {
    // Sans protection, « …%,role.neq.x,first_name.ilike.%… » ajoute « rôle ≠ x » : tout le monde correspond
    const term = `introuvable${randomUUID().slice(0, 6)}`
    const res = await api()
      .get(`/api/admin/users?${new URLSearchParams({ search: `${term}%,role.neq.x,first_name.ilike.%${term}` })}`)
      .set('Authorization', admin.auth)

    expect(res.status).toBe(200)
    expect(res.body.pagination.total).toBe(0)
  })
})
