import { test, expect } from '@playwright/test'
import { createMember, login } from './support'

test('les écoles : chaque carte mène à ses membres dans l’annuaire', async ({ page }) => {
  const member = await createMember()
  await login(page, member.email)

  await page.goto('/dashboard/schools')
  await expect(page.getByRole('heading', { level: 1, name: /écoles?, une seule famille|écoles du réseau/ })).toBeVisible()
  const voir = page.getByRole('link', { name: /^Voir les .* membres? de / }).first()
  await expect(voir).toHaveAttribute('href', /\/dashboard\/directory\?school=/)
  await voir.click()
  await expect(page).toHaveURL(/\/dashboard\/directory\?school=/)
})
