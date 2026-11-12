import { randomUUID } from 'crypto'
import { test, expect, type Page } from '@playwright/test'
import { createMember, login, schoolByName, schoolNameOf } from './support'

async function adminConnecte(page: Page) {
  const a = await createMember({ profile: { role: 'admin', max_codes_allowed: 999 } })
  await login(page, a.email)
  await page.goto('/dashboard/admin/schools')
}

test('ajouter une école, lui donner un sigle, puis la supprimer après confirmation', async ({ page }) => {
  const nom = `École ajoutée ${randomUUID().slice(0, 6)}`
  await adminConnecte(page)

  await page.getByRole('button', { name: 'Ajouter une école' }).click()
  const panneau = page.getByRole('region', { name: 'L’école choisie' })
  await panneau.getByLabel('Nom complet').fill(nom)
  await panneau.getByLabel('Pays').fill('Bénin')
  await panneau.getByLabel('Ville').fill('Cotonou')
  await expect(panneau.getByText('Sans sigle, l’école n’apparaît pas')).toBeVisible()
  await panneau.getByRole('button', { name: 'Ajouter l’école' }).click()
  await expect.poll(async () => (await schoolByName(nom))?.city).toBe('Cotonou')

  // La nouvelle école est choisie : on lui donne un sigle
  await expect(panneau.getByLabel('Nom complet')).toHaveValue(nom)
  await panneau.getByLabel('Sigle').fill('TSTE')
  await panneau.getByLabel('Fondée en').fill('1975')
  await panneau.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(panneau.getByRole('status')).toHaveText('Enregistré')
  expect(await schoolByName(nom)).toMatchObject({ acronym: 'TSTE', established_year: 1975 })

  await panneau.getByRole('button', { name: 'Supprimer l’école' }).click()
  await panneau.getByRole('button', { name: 'Supprimer l’école' }).last().click()
  await expect.poll(() => schoolByName(nom)).toBeNull()
})

test('une école qui a des membres ne propose pas la suppression, et un champ vide est signalé', async ({ page }) => {
  const membre = await createMember()
  await adminConnecte(page)

  await page.getByRole('searchbox', { name: 'Rechercher une école' }).fill(await schoolNameOf(membre.schoolId))
  const panneau = page.getByRole('region', { name: 'L’école choisie' })
  await expect(panneau.getByText('1 membre y est rattaché : l’école ne peut pas être supprimée.')).toBeVisible()
  await expect(panneau.getByRole('button', { name: 'Supprimer l’école' })).toHaveCount(0)

  await panneau.getByLabel('Ville').fill('')
  await panneau.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(panneau.getByText('Il manque la ville.')).toBeVisible()
})
