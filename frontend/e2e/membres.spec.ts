import { randomUUID } from 'crypto'
import { test, expect, type Page } from '@playwright/test'
import { columnOf, createMember, createSchool, login } from './support'

/** Un administrateur connecté, et une école à part avec deux membres de la même promo */
async function preparer(page: Page) {
  const ecole = await createSchool()
  const suffixe = randomUUID().slice(0, 6)
  const a = await createMember({ firstName: 'Aminata', lastName: `Touré${suffixe}`, schoolId: ecole })
  const b = await createMember({ firstName: 'Jean', lastName: `Ouédraogo${suffixe}`, schoolId: ecole })
  const adminUser = await createMember({ profile: { role: 'admin', max_codes_allowed: 999 } })
  await login(page, adminUser.email)
  await page.goto('/dashboard/admin/users')
  await page.getByRole('combobox', { name: 'École' }).selectOption(ecole)
  return { a, b, suffixe }
}

test('les nombres suivent l’école choisie, et nommer un ambassadeur retire l’option aux autres membres de sa promo', async ({ page }) => {
  const { b, suffixe } = await preparer(page)

  await expect(page.getByText(/^2 membres de École e2e/)).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Membres/ })).toContainText('2')
  await expect(page.getByRole('radio', { name: /^Administrateurs/ })).toContainText('0')

  const detail = page.getByRole('region', { name: 'Le membre choisi' })
  await page.getByRole('button', { name: new RegExp(`Aminata Touré${suffixe}`) }).click()
  await detail.getByRole('switch', { name: /Ambassadeur de sa promo/ }).click()
  await expect(detail.getByRole('switch', { name: /Ambassadeur de sa promo/ })).toHaveAttribute('aria-checked', 'true')

  await page.getByRole('button', { name: new RegExp(`Jean Ouédraogo${suffixe}`) }).click()
  await expect(detail.getByText(`Aminata Touré${suffixe} représente la promo`)).toBeVisible()
  await expect(detail.getByRole('switch')).toHaveCount(0)
  expect(await columnOf(b.id, 'is_ambassador')).toBe(false)
})

test('changer le rôle, puis supprimer un compte après confirmation', async ({ page }) => {
  const { a, b, suffixe } = await preparer(page)
  const detail = page.getByRole('region', { name: 'Le membre choisi' })

  await page.getByRole('button', { name: new RegExp(`Aminata Touré${suffixe}`) }).click()
  await detail.getByRole('radio', { name: 'Modérateur' }).click()
  await expect.poll(() => columnOf(a.id, 'role')).toBe('moderator')
  await expect(page.getByRole('radio', { name: /^Modérateurs/ })).toContainText('1')

  await page.getByRole('button', { name: new RegExp(`Jean Ouédraogo${suffixe}`) }).click()
  await expect(detail.getByRole('link', { name: 'Profil' })).toHaveAttribute('href', `/profile/${b.id}`)
  await detail.getByRole('button', { name: 'Supprimer le compte' }).click()
  await detail.getByRole('button', { name: 'Supprimer le compte' }).last().click()
  await expect.poll(() => columnOf(b.id, 'id')).toBeNull()
  await expect(page.getByRole('button', { name: new RegExp(`Jean Ouédraogo${suffixe}`) })).toHaveCount(0)
})

test('sur mobile, le type se choisit dans une liste et chaque membre se déplie sur place', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const { suffixe } = await preparer(page)

  await expect(page.getByRole('combobox', { name: 'Type de membre' })).toContainText('Membres (2)')
  const ligne = page.getByRole('button', { name: new RegExp(`Aminata Touré${suffixe}`) })
  await expect(ligne).toHaveAttribute('aria-expanded', 'false')
  await ligne.click()
  await expect(ligne).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('radio', { name: 'Admin.' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
