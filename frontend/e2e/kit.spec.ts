import { test, expect } from '@playwright/test'
import { createMember, login } from './support'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test('le kit réseaux sociaux : textes par réseau et par école, téléchargement d’un visuel et du zip', async ({ page }) => {
  const a = await createMember({ profile: { role: 'admin', max_codes_allowed: 999 } })
  await login(page, a.email)
  await page.goto('/dashboard/admin/kit')
  await expect(page.getByRole('heading', { level: 1, name: 'Kit réseaux sociaux' })).toBeVisible()

  // Le texte suit le réseau, et l'école choisie
  const ecoles = page.getByRole('region', { name: '3. Les neuf écoles' })
  await ecoles.getByRole('radio', { name: 'X' }).click()
  await expect(ecoles.getByText(/^Neuf écoles, une seule famille : EMPT/)).toBeVisible()
  await ecoles.getByRole('combobox', { name: 'École' }).selectOption('PMS')
  await expect(ecoles.getByText(/^PMS · Saint-Louis, Sénégal/)).toBeVisible()
  await ecoles.getByRole('button', { name: 'Copier le texte' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('PMS · Saint-Louis, Sénégal')

  // Un visuel se télécharge tel quel
  const lancement = page.getByRole('region', { name: '1. Lancement' })
  const lien = lancement.getByRole('link', { name: 'Télécharger' }).first()
  await expect(lien).toHaveAttribute('href', '/kit/visuels/01-lancement/lancement-carre.png')
  expect((await page.request.get('/kit/visuels/01-lancement/lancement-carre.png')).headers()['content-type']).toBe('image/png')

  // Tout le kit, en zip
  const telechargement = page.waitForEvent('download', { timeout: 60_000 })
  await page.getByRole('button', { name: 'Tout télécharger (zip)' }).click()
  expect((await telechargement).suggestedFilename()).toBe('aet-connect-kit-reseaux.zip')
})
