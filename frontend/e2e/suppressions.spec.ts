import { randomUUID } from 'crypto'
import { test, expect, type Page } from '@playwright/test'
import { columnOf, createDeletionRequest, createMember, deletionStatusOf, login } from './support'

async function adminConnecte(page: Page) {
  const a = await createMember({ profile: { role: 'admin', max_codes_allowed: 999 } })
  await login(page, a.email)
  await page.goto('/dashboard/admin/deletions')
}

/** La carte d'une demande en attente, retrouvée par le nom */
const carte = (page: Page, nom: string) => page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: nom }) })

test('supprimer le compte après confirmation : la demande passe dans l’historique', async ({ page }) => {
  const nom = `Yao Kouassi${randomUUID().slice(0, 6)}`
  const membre = await createMember({ firstName: 'Yao', lastName: nom.replace('Yao ', '') })
  const id = await createDeletionRequest(membre, { name: nom, reason: 'Je n’utilise plus le site.' })
  await adminConnecte(page)

  const c = carte(page, nom)
  await expect(c).toContainText('« Je n’utilise plus le site. »')
  await c.getByRole('button', { name: 'Supprimer le compte' }).click()
  await c.getByRole('button', { name: 'Supprimer le compte' }).click()

  await expect.poll(() => deletionStatusOf(id)).toBe('approved')
  expect(await columnOf(membre.id, 'id')).toBeNull()
  await expect(page.getByRole('region', { name: 'Historique' }).getByText(nom)).toBeVisible()
})

test('garder le compte après confirmation : le membre reste, la demande est classée', async ({ page }) => {
  const nom = `Serge Kouamé${randomUUID().slice(0, 6)}`
  const membre = await createMember({ firstName: 'Serge', lastName: nom.replace('Serge ', '') })
  const id = await createDeletionRequest(membre, { name: nom })
  await adminConnecte(page)

  const c = carte(page, nom)
  await expect(c).toContainText('Aucune raison donnée.')
  await c.getByRole('button', { name: 'Garder le compte' }).click()
  await expect(c).toContainText(membre.email)
  await c.getByRole('button', { name: 'Garder le compte' }).click()

  await expect.poll(() => deletionStatusOf(id)).toBe('rejected')
  expect(await columnOf(membre.id, 'id')).toBe(membre.id)
})

test('le compte d’un administrateur ne se supprime pas depuis une demande', async ({ page }) => {
  const nom = `Fatou Sow${randomUUID().slice(0, 6)}`
  const membre = await createMember({ firstName: 'Fatou', lastName: nom.replace('Fatou ', ''), profile: { role: 'admin', max_codes_allowed: 999 } })
  await createDeletionRequest(membre, { name: nom })
  await adminConnecte(page)

  const c = carte(page, nom)
  await expect(c).toContainText('C’est un compte administrateur')
  await expect(c.getByRole('button', { name: 'Supprimer le compte' })).toHaveCount(0)
  await expect(c.getByRole('link', { name: 'Ouvrir la page des membres' })).toHaveAttribute('href', '/dashboard/admin/users')
})
