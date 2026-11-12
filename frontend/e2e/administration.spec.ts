import { randomUUID } from 'crypto'
import { test, expect } from '@playwright/test'
import { createAccessRequest, createMember, login } from './support'

test('administration : les chiffres mènent à leur section et la dernière demande d’accès apparaît', async ({ page }) => {
  const adminUser = await createMember({ profile: { role: 'admin', max_codes_allowed: 999 } })
  const nom = `Demande${randomUUID().slice(0, 6)}`
  await createAccessRequest({ firstName: 'Mariam', lastName: nom, schoolId: adminUser.schoolId, wantsAmbassador: true })
  await login(page, adminUser.email)

  await page.goto('/dashboard/admin')
  await expect(page.getByRole('heading', { level: 1, name: 'Le réseau en chiffres' })).toBeVisible()
  await expect(page.getByRole('link', { name: /^Voir\s: [\d\s]+ membres?/ })).toHaveAttribute('href', '/dashboard/admin/users')
  await expect(page.getByRole('link', { name: /\d+ demandes? de suppression en attente/ })).toHaveAttribute('href', '/dashboard/admin/deletions')
  await expect(page.getByRole('heading', { name: 'Membres par école' })).toBeVisible()

  const demande = page.getByRole('listitem').filter({ hasText: nom })
  await expect(demande).toContainText('veut représenter sa promo')
  await demande.getByRole('link', { name: `Répondre à Mariam ${nom}` }).click()
  await expect(page).toHaveURL(/\/dashboard\/admin\/pending/)
})

test('administration : un membre qui n’est pas administrateur est renvoyé à son espace', async ({ page }) => {
  const member = await createMember()
  await login(page, member.email)

  await page.goto('/dashboard/admin')
  await expect(page).toHaveURL(/\/dashboard$/)
})
