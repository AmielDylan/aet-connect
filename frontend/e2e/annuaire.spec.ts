import { randomUUID } from 'crypto'
import { test, expect } from '@playwright/test'
import { createMember, login } from './support'

// L'annuaire : le raccourci « Ma promo » et la recherche par nom.
test('l’annuaire retrouve un collègue par « Ma promo » et par son nom', async ({ page }) => {
  const nom = `Keita${randomUUID().slice(0, 6)}`
  const moi = await createMember({ firstName: 'Awa', lastName: 'Diop' })
  await createMember({ firstName: 'Moussa', lastName: nom, schoolId: moi.schoolId })

  await login(page, moi.email)
  await page.goto('/dashboard/directory')
  await page.getByRole('button', { name: 'Ma promo' }).click()
  await expect(page.getByRole('button', { name: 'Ma promo' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('link', { name: new RegExp(`Moussa ${nom}`) })).toBeVisible()

  await page.getByRole('button', { name: 'Ma promo' }).click()
  await page.getByRole('searchbox', { name: /par son nom/ }).fill(nom)
  await expect(page.getByText(/1 AET correspond à votre recherche/)).toBeVisible()
  await expect(page.getByRole('link', { name: new RegExp(`Moussa ${nom}`) })).toBeVisible()
})
