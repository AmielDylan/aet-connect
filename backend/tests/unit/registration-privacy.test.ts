import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'crypto'
import app from '@/app'
import { supabase } from '@/config/database'
import { createPromo, createMember } from './support/fixtures'

// Les routes d'inscription sont publiques : elles ne doivent rien révéler des membres.

describe('POST /api/register/check-school-promo', () => {
  it('dit seulement si la promo a des membres : ni nom, ni photo, ni nombre', async () => {
    const promo = await createPromo()
    await createMember({ promo, isAmbassador: true })
    await createMember({ promo })

    const res = await request(app)
      .post('/api/register/check-school-promo')
      .set('X-Forwarded-For', `198.51.100.${Math.floor(Math.random() * 200)}`)
      .send({ school_id: promo.schoolId, entry_year: promo.entryYear })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ exists: true })
  })

  it('répond { exists: false } pour une promo sans membre', async () => {
    const promo = await createPromo()
    const res = await request(app)
      .post('/api/register/check-school-promo')
      .set('X-Forwarded-For', `198.51.100.${Math.floor(Math.random() * 200)}`)
      .send({ school_id: promo.schoolId, entry_year: promo.entryYear })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ exists: false })
  })
})

describe('POST /api/register/request-code-from-peer', () => {
  it('enregistre la demande pour les administrateurs, sans révéler aucun membre', async () => {
    const promo = await createPromo()
    await createMember({ promo, isAmbassador: true })
    const email = `demande-code-${randomUUID()}@aetconnect.test`

    const res = await request(app)
      .post('/api/register/request-code-from-peer')
      .set('X-Forwarded-For', `198.51.100.${Math.floor(Math.random() * 200)}`)
      .send({
        school_id: promo.schoolId,
        entry_year: promo.entryYear,
        first_name: 'Awa',
        last_name: 'Diop',
        email,
        message: 'Je suis de la promo 2005, je cherche à rejoindre mes collègues.',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.request_id).toEqual(expect.any(String))
    expect(res.body).not.toHaveProperty('recipient_name')

    const { data } = await supabase.from('access_requests').select('*').eq('id', res.body.request_id).single()
    expect(data).toMatchObject({ email, status: 'pending', wants_ambassador: false, school_id: promo.schoolId })
  })

  it("refuse une demande sans email (on ne pourrait pas transmettre le code)", async () => {
    const promo = await createPromo()
    await createMember({ promo })

    const res = await request(app)
      .post('/api/register/request-code-from-peer')
      .set('X-Forwarded-For', `198.51.100.${Math.floor(Math.random() * 200)}`)
      .send({ school_id: promo.schoolId, entry_year: promo.entryYear, first_name: 'Awa', last_name: 'Diop', message: 'Bonjour à tous' })

    expect(res.status).toBe(400)
  })
})
