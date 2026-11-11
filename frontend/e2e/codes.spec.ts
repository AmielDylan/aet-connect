import { test, expect } from '@playwright/test'
import { createMember, login } from './support'

// « Mes codes » : un membre crée un code, le retrouve prêt à partager, puis le révoque.
test('un membre crée un code, puis le révoque : l’invitation lui revient', async ({ page }) => {
  const moi = await createMember({ firstName: 'Awa', lastName: 'Diop' })
  await login(page, moi.email)
  await page.goto('/dashboard/codes')
  await expect(page.getByText(/Il vous reste\s*3\s*invitations sur 3/)).toBeVisible()

  await page.getByRole('button', { name: 'Créer un code' }).click()
  await expect(page.getByText('Votre nouveau code est prêt')).toBeVisible()
  await expect(page.getByText(/Il vous reste\s*2\s*invitations sur 3/)).toBeVisible()
  await expect(page.getByRole('list', { name: /Partager le code AET-/ })).toBeVisible()

  await page.getByRole('button', { name: 'Révoquer', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Révoquer le code' }).click()
  await expect(page.getByText(/Il vous reste\s*3\s*invitations sur 3/)).toBeVisible()
  await expect(page.getByText('Aucun code en attente.', { exact: false })).toBeVisible()
})
