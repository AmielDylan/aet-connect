import { test, expect, type Page } from '@playwright/test'
import { createMember } from './support'

// Mot de passe oublié, de bout en bout : l'email part vraiment (Mailpit, la boîte de test de Supabase local),
// le lien ouvre la page du nouveau mot de passe, et le nouveau mot de passe permet de se connecter.
const MAILPIT = 'http://127.0.0.1:54324/api/v1'
const NOUVEAU = 'Nouveau2026!'

/** Le lien de réinitialisation reçu par cette adresse (attend l'email quelques secondes) */
async function resetLink(email: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${MAILPIT}/search?query=${encodeURIComponent(`to:"${email}"`)}`)
    const { messages } = (await res.json()) as { messages: Array<{ ID: string }> }
    if (messages?.length) {
      const msg = (await (await fetch(`${MAILPIT}/message/${messages[0].ID}`)).json()) as { HTML: string; Text: string }
      const link = (msg.HTML + ' ' + msg.Text).match(/https?:\/\/[^\s"'<>]+\/auth\/v1\/verify[^\s"'<>]+/)?.[0]
      if (link) return link.replace(/&amp;/g, '&')
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Aucun email de réinitialisation pour ${email}`)
}

async function demanderLeLien(page: Page, email: string) {
  await page.goto('/forgot-password')
  await page.getByLabel('Email').fill(email)
  await page.getByRole('button', { name: 'Recevoir le lien' }).click()
  await expect(page.getByRole('heading', { name: 'Le lien est en route' })).toBeVisible()
}

test('mot de passe oublié : le lien reçu permet de choisir un nouveau mot de passe, puis de se connecter', async ({ page, browser }) => {
  const { email } = await createMember()
  await demanderLeLien(page, email)

  await page.goto(await resetLink(email))
  await expect(page.getByRole('heading', { name: 'Un nouveau mot de passe' })).toBeVisible()
  await page.getByLabel('Nouveau mot de passe').fill(NOUVEAU)
  await page.getByLabel('Confirmation').fill(NOUVEAU)
  await page.getByRole('button', { name: 'Enregistrer le mot de passe' }).click()
  await expect(page.getByRole('heading', { name: 'C’est fait' })).toBeVisible()

  // Le nouveau mot de passe ouvre une session, dans un navigateur neuf
  const ailleurs = await browser.newPage()
  await ailleurs.goto('/login')
  await ailleurs.getByLabel('Email').fill(email)
  await ailleurs.getByLabel('Mot de passe', { exact: true }).fill(NOUVEAU)
  await ailleurs.getByRole('button', { name: 'Se connecter' }).click()
  await ailleurs.waitForURL(/\/dashboard/)
  await ailleurs.close()
})

test('un lien de réinitialisation déjà utilisé affiche « Ce lien n’est plus valable »', async ({ page, browser }) => {
  const { email } = await createMember()
  await demanderLeLien(page, email)
  const link = await resetLink(email)

  await page.goto(link)
  await expect(page.getByRole('heading', { name: 'Un nouveau mot de passe' })).toBeVisible()

  // Le même lien, une seconde fois
  const encore = await browser.newPage()
  await encore.goto(link)
  await expect(encore.getByRole('heading', { name: 'Ce lien n’est plus valable' })).toBeVisible({ timeout: 10_000 })
  await expect(encore.getByRole('link', { name: 'Recevoir un nouveau lien' })).toBeVisible()
  await encore.close()
})
