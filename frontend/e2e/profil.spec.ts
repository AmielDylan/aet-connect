import { test, expect, type Page } from '@playwright/test'
import { createMember, login } from './support'

// Le profil d'un membre : le bandeau garde la même hauteur, que le membre montre tout ou rien.
const PROFIL_COMPLET = {
  bio: 'Ingénieure en télécommunications, toujours partante pour aider un collègue de la promo ou un plus jeune qui cherche sa voie.',
  current_city: 'Abidjan',
  current_country: 'Côte d’Ivoire',
  phone: '+225 07 00 00 00 00',
  linkedin_url: 'https://www.linkedin.com/in/exemple',
}
const TOUT_VISIBLE = { show_email: true, show_phone: true, show_bio: true, show_linkedin: true, show_current_location: true }
const RIEN_VISIBLE = { show_email: false, show_phone: false, show_bio: false, show_linkedin: false, show_current_location: false }

async function hauteurs(page: Page, id: string) {
  await page.goto(`/profile/${id}`)
  const bandeau = page.locator('main section').first()
  await expect(bandeau.getByRole('heading', { level: 1 })).toBeVisible()
  const portrait = bandeau.locator('> div').last()
  return { bandeau: (await bandeau.boundingBox())!.height, portrait: (await portrait.boundingBox())!.height }
}

test('le bandeau du profil a la même hauteur, coordonnées visibles ou masquées', async ({ page }) => {
  const moi = await createMember({ firstName: 'Awa', lastName: 'Diop' })
  const complet = await createMember({ firstName: 'Aïcha', lastName: 'Traoré-Kouassi', schoolId: moi.schoolId, profile: PROFIL_COMPLET, privacy: TOUT_VISIBLE })
  const discret = await createMember({ firstName: 'Yao', lastName: 'Kouassi', schoolId: moi.schoolId, profile: PROFIL_COMPLET, privacy: RIEN_VISIBLE })

  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page, moi.email)

  const a = await hauteurs(page, complet.id)
  await expect(page.getByText('Votre collègue de promotion')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Lui écrire' })).toBeVisible()
  const b = await hauteurs(page, discret.id)
  await expect(page.getByText('Yao n’a pas rendu ses coordonnées visibles.')).toBeVisible()

  expect(a.bandeau).toBe(b.bandeau)
  // Le portrait (avec sa marge de 12px en haut et en bas) donne la hauteur du bandeau
  expect(Math.round(a.portrait + 24)).toBe(Math.round(a.bandeau))
})
