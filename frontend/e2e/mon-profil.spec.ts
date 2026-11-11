import { test, expect } from '@playwright/test'
import { columnOf, createMember, login } from './support'

// « Mon profil » : ce que le membre efface est effacé, ce qu'il masque reste masqué.

test('un champ vidé est effacé', async ({ page }) => {
  const member = await createMember({ profile: { linkedin_url: 'https://www.linkedin.com/in/exemple', current_city: 'Abidjan' } })
  await login(page, member.email)

  await page.goto('/dashboard/profile')
  await expect(page.locator('#linkedin_url')).toHaveValue('https://www.linkedin.com/in/exemple')
  await page.locator('#linkedin_url').fill('')
  await page.locator('#current_city').fill('')
  await page.locator('form').filter({ has: page.locator('#first_name') }).getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText('Enregistré', { exact: true })).toBeVisible()

  await expect.poll(() => columnOf(member.id, 'linkedin_url')).toBeNull()
  await expect.poll(() => columnOf(member.id, 'current_city')).toBeNull()
})

test('un LinkedIn sans https est signalé avant tout envoi', async ({ page }) => {
  const member = await createMember()
  await login(page, member.email)

  await page.goto('/dashboard/profile')
  await page.locator('#linkedin_url').fill('linkedin.com/in/exemple')
  await page.locator('form').filter({ has: page.locator('#first_name') }).getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/Il manque le début de l’adresse/)).toBeVisible()
  expect(await columnOf(member.id, 'linkedin_url')).toBeNull()
})

test('masquer son email persiste après rechargement', async ({ page }) => {
  const member = await createMember({ privacy: { show_email: true } })
  await login(page, member.email)

  await page.goto('/dashboard/profile')
  const email = page.locator('#show_email')
  await expect(email).toHaveAttribute('aria-checked', 'true')
  await email.click()
  await page.getByRole('button', { name: 'Enregistrer ces choix' }).click()
  await expect.poll(() => columnOf(member.id, 'show_email', 'user_privacy_settings')).toBe(false)

  await page.reload()
  await expect(page.locator('#show_email')).toHaveAttribute('aria-checked', 'false')
})

test('une photo en paysage reste carrée dans le bandeau et laisse sa place au nom', async ({ page }) => {
  const member = await createMember({ firstName: 'Koffi', lastName: 'Mensah' })
  await page.setViewportSize({ width: 1024, height: 1366 })
  await login(page, member.email)

  await page.goto('/dashboard/profile')
  await page.locator('input[type=file]').setInputFiles('public/images/accueil/garde-honneur.jpg')
  await expect(page.getByRole('button', { name: 'Retirer la photo' })).toBeVisible({ timeout: 15_000 })
  await expect.poll(() => columnOf(member.id, 'avatar_url')).not.toBeNull()

  const bandeau = page.locator('main section').first()
  const portrait = bandeau.locator('> div').last()
  await expect(portrait.locator('img')).toBeVisible()
  const p = (await portrait.boundingBox())!
  expect(Math.abs(p.width - p.height)).toBeLessThan(2)
  expect((await bandeau.getByRole('heading', { level: 1 }).boundingBox())!.width).toBeGreaterThan(400)
})
