import { randomUUID } from 'crypto'
import { test, expect, type Page } from '@playwright/test'
import { accessRequestOf, createAccessRequest, createMember, createSchool, login } from './support'

async function adminConnecte(page: Page) {
  const a = await createMember({ profile: { role: 'admin', max_codes_allowed: 999 } })
  await login(page, a.email)
}

/** Ouvre la demande dans la liste ; renvoie le panneau de détail visible */
async function ouvrir(page: Page, nom: string) {
  await page.goto('/dashboard/admin/pending')
  const ligne = page.getByRole('button', { name: new RegExp(nom) })
  if ((await ligne.getAttribute('aria-expanded')) !== 'true') await ligne.click()
  return page.getByRole('region', { name: 'La demande choisie' })
}

test('accepter une demande en nommant la personne ambassadeur : le code et le message à transmettre s’affichent', async ({ page }) => {
  const nom = `Accepte${randomUUID().slice(0, 6)}`
  const id = await createAccessRequest({ firstName: 'Mariam', lastName: nom, schoolId: await createSchool(), wantsAmbassador: true })
  await adminConnecte(page)

  const detail = await ouvrir(page, nom)
  await expect(detail.getByRole('switch', { name: /Nommer ambassadeur/ })).toHaveAttribute('aria-checked', 'true')
  await detail.getByRole('button', { name: 'Accepter et créer le code' }).click()

  await expect(detail.getByText('Demande acceptée')).toBeVisible()
  await expect(detail.getByText(/^AET-[A-Z0-9]{4}-[A-Z0-9]{4}$/)).toBeVisible()
  await expect(detail.getByRole('button', { name: 'Copier le message' })).toBeVisible()
  expect(await accessRequestOf(id)).toEqual({ status: 'approved', grants_ambassador: true })
})

test('quand la promo a déjà un ambassadeur, l’option n’apparaît pas et la page dit qui il est', async ({ page }) => {
  const ecole = await createSchool()
  await createMember({ firstName: 'Aminata', lastName: 'Touré', schoolId: ecole, profile: { is_ambassador: true } })
  const nom = `Promo${randomUUID().slice(0, 6)}`
  await createAccessRequest({ firstName: 'Ibrahim', lastName: nom, schoolId: ecole, wantsAmbassador: true })
  await adminConnecte(page)

  const detail = await ouvrir(page, nom)
  await expect(detail.getByText('Aminata Touré représente la promo 2005.')).toBeVisible()
  await expect(detail.getByRole('switch')).toHaveCount(0)
})

test('refuser une demande demande confirmation, puis la classe dans les refusées', async ({ page }) => {
  const nom = `Refuse${randomUUID().slice(0, 6)}`
  const id = await createAccessRequest({ firstName: 'Paul', lastName: nom, schoolId: await createSchool() })
  await adminConnecte(page)

  const detail = await ouvrir(page, nom)
  await detail.getByRole('button', { name: 'Refuser', exact: true }).click()
  await detail.getByRole('button', { name: 'Refuser la demande' }).click()

  await expect.poll(async () => (await accessRequestOf(id)).status).toBe('rejected')
  await page.getByRole('radio', { name: /Refusées/ }).click()
  await expect(page.getByRole('button', { name: new RegExp(nom) })).toBeVisible()
})
