import { test, expect } from '@playwright/test'
import { createMember, createCode, avatarUrlOf, login, logout, headerName } from './support'

test("après modification du profil, l'en-tête affiche le nouveau nom sans recharger", async ({ page }) => {
  const member = await createMember({ firstName: 'Awa', lastName: 'Diop' })
  await login(page, member.email)

  await page.goto('/dashboard/profile')
  await page.getByRole('button', { name: 'Modifier' }).click()
  await page.locator('#first_name').fill('Aïssatou')
  await page.locator('form').filter({ has: page.locator('#first_name') }).getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/mis à jour|enregistré/i).first()).toBeVisible()

  expect(await headerName(page)).toBe('Aïssatou Diop')
})

test("après déconnexion, le membre suivant ne voit rien du précédent", async ({ page }) => {
  const first = await createMember({ firstName: 'Premier' })
  const second = await createMember({ firstName: 'Second' })
  const firstCode = await createCode(first.id, first.schoolId)

  await login(page, first.email)
  await page.goto('/dashboard/codes')
  await expect(page.getByText(firstCode)).toBeVisible()
  await logout(page)

  // Reconnexion dans le même onglet, sans rechargement : seul le cache pourrait trahir le précédent
  await login(page, second.email, { reload: false })
  // La requête des codes du second membre reste sans réponse : tout code affiché viendrait du cache
  await page.route('**/api/codes/my-codes', () => {})
  await page.getByRole('link', { name: 'Mes codes' }).click()
  await page.waitForTimeout(1_500)
  expect(await page.getByText(firstCode).count()).toBe(0)
  await page.unroute('**/api/codes/my-codes')
  expect(await headerName(page)).toContain('Second')
})

test("la suppression de l'avatar persiste après rechargement", async ({ page }) => {
  const member = await createMember({ profile: { avatar_url: 'http://127.0.0.1:54321/storage/v1/object/public/avatars/inconnu/avatar.png' } })
  await login(page, member.email)

  await page.goto('/dashboard/profile')
  await page.getByRole('button', { name: "Supprimer l'avatar" }).click()
  await expect.poll(() => avatarUrlOf(member.id)).toBeNull()

  await page.reload()
  await expect(page.getByRole('button', { name: "Supprimer l'avatar" })).toHaveCount(0)
})

test("le profil d'un membre masqué affiche son erreur en moins de 2 secondes", async ({ page }) => {
  const viewer = await createMember()
  const hidden = await createMember({ firstName: 'Discrète', privacy: { show_in_directory: false } })
  await login(page, viewer.email)

  const start = Date.now()
  await page.goto(`/profile/${hidden.id}`)
  await expect(page.getByText(/introuvable|non trouvé|n'existe pas/i).first()).toBeVisible({ timeout: 5_000 })

  expect(Date.now() - start).toBeLessThan(2_000)
})
