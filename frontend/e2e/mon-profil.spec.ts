import { test, expect } from '@playwright/test'
import { PASSWORD, columnOf, createMember, login } from './support'

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

test('le portrait garde la même taille de la tablette au grand écran, sans toucher le bas du bandeau', async ({ page }) => {
  const member = await createMember({ firstName: 'Koffi', lastName: 'Mensah' })
  await login(page, member.email)

  await page.goto('/dashboard/profile')
  // Une photo en paysage : elle ne doit ni élargir le portrait, ni déborder du bandeau
  await page.locator('input[type=file]').setInputFiles('public/images/accueil/garde-honneur.jpg')
  await expect(page.getByRole('button', { name: 'Retirer la photo' })).toBeVisible({ timeout: 15_000 })
  await expect.poll(() => columnOf(member.id, 'avatar_url')).not.toBeNull()

  for (const largeur of [768, 1024, 1440]) {
    await page.setViewportSize({ width: largeur, height: 1000 })
    const bandeau = page.locator('main section').first()
    const portrait = bandeau.locator('> div').last()
    await expect(portrait.locator('img')).toBeVisible()
    const b = (await bandeau.boundingBox())!
    const p = (await portrait.boundingBox())!
    expect(Math.round(p.width), `largeur ${largeur}`).toBe(264)
    expect(Math.round(p.height), `largeur ${largeur}`).toBe(264)
    expect(b.y + b.height - (p.y + p.height), `largeur ${largeur}`).toBeGreaterThanOrEqual(11)
  }
})

test('la promo ne se masque pas', async ({ page }) => {
  const member = await createMember()
  await login(page, member.email)

  await page.goto('/dashboard/profile')
  await expect(page.locator('#show_email')).toBeVisible()
  await expect(page.locator('#show_entry_year')).toHaveCount(0)
  await expect(page.getByText(/votre promo se voient toujours/)).toBeVisible()
})

test('un nouveau mot de passe suit les règles de l’inscription, tout caractère permis', async ({ page }) => {
  const member = await createMember()
  await login(page, member.email)

  await page.goto('/dashboard/profile')
  await page.locator('#old_password').fill(PASSWORD)
  await page.locator('#new_password').fill('Nouveau#mot2passe')
  await page.locator('#confirm_password').fill('Nouveau#mot2passe')
  await page.getByRole('button', { name: 'Changer le mot de passe' }).click()
  await expect(page.getByText('Votre mot de passe a changé')).toBeVisible()
})
