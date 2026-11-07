import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '@/app'

describe('POST /api/register/verify-invitation-code', () => {
  it('refuse au-delà de 10 vérifications par minute depuis la même adresse', async () => {
    const statuses: number[] = []
    for (let i = 0; i < 11; i++) {
      const res = await request(app)
        .post('/api/register/verify-invitation-code')
        .set('X-Forwarded-For', '203.0.113.7')
        .send({ code: 'AET-ZZZZ-ZZZZ' })
      statuses.push(res.status)
    }

    expect(statuses.slice(0, 10).every((s) => s !== 429)).toBe(true)
    expect(statuses[10]).toBe(429)
  })
})
