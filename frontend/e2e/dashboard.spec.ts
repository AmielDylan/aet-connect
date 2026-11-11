import { randomUUID } from 'crypto'
import { test, expect } from '@playwright/test'
import { createMember, login } from './support'

// L'accueil de l'espace membre : la promo, la recherche, et le lien vers l'annuaire filtré sur la promo.
test('l’accueil montre la promo, et la recherche mène au profil d’un collègue', async ({ page }) => {
  // Un nom unique à chaque passage : la base locale garde les membres des passages précédents
  const nom = `Mensah${randomUUID().slice(0, 6)}`
  const moi = await createMember({ firstName: 'Awa', lastName: 'Diop' })
  const collegue = await createMember({ firstName: 'Koffi', lastName: nom, schoolId: moi.schoolId })

  await login(page, moi.email)
  await expect(page.getByRole('heading', { name: 'Bonjour, Awa' })).toBeVisible()
  await expect(page.getByText(/Vous êtes\s*2\s*de votre promo/)).toBeVisible()
  // Le collègue arrivé figure dans le trombinoscope
  await expect(page.getByRole('link', { name: new RegExp(`Koffi ${nom}`) })).toBeVisible()

  // Recherche en fenêtre : un nom, puis le profil
  await page.getByRole('button', { name: 'Rechercher un AET' }).click()
  await page.getByRole('searchbox', { name: 'Rechercher un AET' }).fill(nom)
  const resultat = page.getByRole('dialog').getByRole('link', { name: new RegExp(`Koffi ${nom}`) })
  await expect(resultat).toBeVisible()
  await resultat.click()
  await expect(page).toHaveURL(new RegExp(`/profile/${collegue.id}`))
})

test('« Voir toute la promo » ouvre l’annuaire filtré sur l’école et l’année', async ({ page }) => {
  const moi = await createMember({ firstName: 'Awa', lastName: 'Diop' })
  const nom = `Kouassi${randomUUID().slice(0, 6)}`
  await createMember({ firstName: 'Yao', lastName: nom, schoolId: moi.schoolId })

  await login(page, moi.email)
  await page.getByRole('link', { name: 'Voir toute la promo' }).click()
  await expect(page).toHaveURL(new RegExp(`/dashboard/directory\\?school=${moi.schoolId}&year=2005`))
  await expect(page.getByText(`Yao ${nom}`).first()).toBeVisible()
})
